import { useState, useEffect, useCallback } from 'react';
import { s3Client, dynamoDB, GetObjectCommand, GetCommand } from '../../../hooks/awsServices';
import axiosInstance from '../../../hooks/axiosInstance';
import { parseDescription, generateDynamicPrompt } from '../utils';
import { VideoTimeDescription } from '../types';
import { useUserEmail } from '../../../contexts/UserAttributesContext';

export const useCreateManual = (
    fileName: string | null,
    fileData: any,
    manualLevel: string,
    workContent: string,
    onUploadComplete: () => void
) => {
    const userEmail = useUserEmail();
    const [loading, setLoading] = useState(false);
    const [responseData, setResponseData] = useState<any>(null);
    const [data, setData] = useState<VideoTimeDescription[]>([{ video_time: "", description: "" }]);
    const [manual, setManual] = useState("");
    const [executionArn, setExecutionArn] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [customPromptEnabled, setCustomPromptEnabled] = useState(true);
    const [customPrompt, setCustomPrompt] = useState('');
    const [customPromptModalOpen, setCustomPromptModalOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('error');

    const example_prompt = `作業手順のマニュアルの素案をより詳細かつわかりやすく作成してください。  
  手順でより詳細な工程が必要であれば追記してください。その際に、それはなぜ必要なのか理由も記載してください。
  作業を行うための準備・注意点などもあれば追記してください。 それぞれの作業手順は具体的なユースケースを想像して、それらを詳細化していくことで作成してください。
  `;

    useEffect(() => {
        setResponseData(null);
        setExecutionArn(null);
    }, [fileName]);

    // manualLevelとworkContentが変更されたときにプロンプトを自動更新
    useEffect(() => {
        const dynamicPrompt = generateDynamicPrompt(manualLevel, workContent);
        setCustomPrompt(dynamicPrompt);
    }, [manualLevel, workContent]);

    // responseDataが更新されたときにmanualも更新
    useEffect(() => {
        if (responseData) {
            // responseDataの構造に応じてmanualを設定
            if (typeof responseData === 'string') {
                setManual(responseData);
            } else if (responseData.manual) {
                setManual(responseData.manual);
            } else if (responseData.data) {
                setManual(responseData.data);
            } else {
                setManual(JSON.stringify(responseData));
            }
        }
    }, [responseData]);

    const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'error') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    }, []);

    const handleClick = async (reencodeVideo: boolean = false) => {
        // イベントオブジェクトが渡された場合は無視
        if (reencodeVideo && typeof reencodeVideo === 'object' && 'nativeEvent' in reencodeVideo) {
            reencodeVideo = false;
        }
        if (!fileName) {
            alert("ファイルが選択されていません");
            return;
        }
        setLoading(true);
        setResponseData(null);
        const postData = {
            videoURI: process.env.REACT_APP_AWS_BUCKET_NAME + "movie/" + fileName,
            userId: userEmail,
            userName: userEmail,
            manualLevel: manualLevel,
            workContent: workContent,
            reencodeVideo: reencodeVideo === true,
            ...(customPromptEnabled && customPrompt && { customPrompt: customPrompt })
        };
        
        // リクエストサイズをチェック
        const postDataString = JSON.stringify(postData);
        const postDataSize = new Blob([postDataString]).size;
        const postDataSizeKB = (postDataSize / 1024).toFixed(2);
        const postDataSizeMB = (postDataSize / (1024 * 1024)).toFixed(2);
        
        // API Gatewayの制限（10MB）をチェック
        const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024; // 10MB
        if (postDataSize > MAX_PAYLOAD_SIZE) {
            const errorMessage = `リクエストサイズが大きすぎます（${postDataSizeMB}MB）。10MB以下にしてください。`;
            console.error('❌ Request too large:', errorMessage);
            showSnackbar(errorMessage, 'error');
            setLoading(false);
            return;
        }
        
        try {
            const response = await axiosInstance.post(
                "sf-gemini-manual-function",
                postData
            );
            setExecutionArn(response.data?.executionArn);
        } catch (error: any) {
            console.error('❌ API Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
            });
            
            let errorMessage = 'API実行に失敗しました';
            if (error.response?.status === 413) {
                errorMessage = `リクエストサイズが大きすぎます（${postDataSizeMB}MB）。workContentやcustomPromptの内容を短くしてください。`;
            } else if (error.response?.data?.message) {
                errorMessage = `API実行に失敗しました: ${error.response.data.message}`;
            } else if (error.message) {
                errorMessage = `API実行に失敗しました: ${error.message}`;
            }
            
            showSnackbar(errorMessage, 'error');
            setLoading(false);
        }
    };

    const handleRetryWithReencode = async () => {
        await handleClick(true);
    };

    const handleReadExistingData = async () => {
        if (!fileData?.description_path || !fileData?.manual_path) {
            return;
        }

        const descCommand = new GetObjectCommand({
            Bucket: process.env.REACT_APP_AWS_BUCKET_NAME!,
            Key: fileData?.description_path,
        });
        const manualCommand = new GetObjectCommand({
            Bucket: process.env.REACT_APP_AWS_BUCKET_NAME!,
            Key: fileData?.manual_path,
        });
        try {
            const data = await s3Client.send(descCommand);
            const text = await data.Body?.transformToString();
            const manual_data = await s3Client.send(manualCommand);

            if (text) {
                const _res = {
                    manual: await manual_data.Body?.transformToString(),
                    description: text,
                };
                setResponseData(_res);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            showSnackbar(`S3 からのデータ取得に失敗しました: ${message}`, 'error');
        }
    };

    const handleDeleteClickOpen = () => {
        setDeleteOpen(true);
    };

    const handleDeleteClose = () => {
        setDeleteOpen(false);
    };

    const handleDeleteData = async () => {
        const apiUrl = "delete-manual";
        // まず削除確認ダイアログを閉じる
        setDeleteOpen(false);
        
        try {
            await axiosInstance.post(apiUrl, { videoname: fileName, userId: userEmail });
            // 状態をリセット
            setResponseData(null);
            setData([{ video_time: "", description: "" }]);
            setManual("");
            setExecutionArn(null);
            // ファイルリストを更新
            onUploadComplete();
            // 削除後のリロードフラグを設定
            sessionStorage.setItem('skipTermsAfterDelete', 'true');
            // 1秒後にページをリロード
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            // エラーが出ても削除は成功している可能性があるので、状態をリセット
            setResponseData(null);
            setData([{ video_time: "", description: "" }]);
            setManual("");
            setExecutionArn(null);
            // ファイルリストを更新
            onUploadComplete();
            // 削除後のリロードフラグを設定
            sessionStorage.setItem('skipTermsAfterDelete', 'true');
            // 1秒後にページをリロード
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    };

    const handleDataChange = useCallback<
        React.Dispatch<React.SetStateAction<VideoTimeDescription[]>>
    >((newData) => {
        setData(newData);
    }, []);

    const handleSnackbarClose = useCallback(() => {
        setSnackbarOpen(false);
    }, []);

    // Step Function polling
    useEffect(() => {
        if (executionArn) {
            let pollingCount = 0;
            const maxPollingCount = 300;
            let status = "RUNNING";
            const interval = setInterval(async () => {
                if (pollingCount >= maxPollingCount) {
                    setLoading(false);
                    clearInterval(interval);
                    return;
                }

                const apiUrl = "get-step-function-status?executionArn=" + executionArn;
                try {
                    const response = await axiosInstance.get(apiUrl);
                    status = response.data?.status;
                    if (status !== "RUNNING") {
                        clearInterval(interval);
                        // まずloadingを停止
                        setLoading(false);

                        if (status === "SUCCEEDED") {
                            const _res = response.data.output;
                            if (_res && _res !== "undefined" && _res !== "null") {
                                try {
                                    const parsedOutput = JSON.parse(_res);

                                    if (parsedOutput && parsedOutput.success === true) {
                                        // 成功時：既存データ読み出しと同じ処理
                                        try {
                                            const getCommand = new GetCommand({
                                                TableName: process.env.REACT_APP_DYNAMODB_TABLE_NAME!,
                                                Key: { FileName: userEmail + "_" + fileName },
                                            });
                                            const dynamoResult = await dynamoDB.send(getCommand);
                                            const latestFileData = dynamoResult.Item;

                                            if (latestFileData?.description_path && latestFileData?.manual_path) {
                                                const descCommand = new GetObjectCommand({
                                                    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME!,
                                                    Key: latestFileData.description_path,
                                                });
                                                const manualCommand = new GetObjectCommand({
                                                    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME!,
                                                    Key: latestFileData.manual_path,
                                                });
                                                
                                                const descriptionData = await s3Client.send(descCommand);
                                                const manualData = await s3Client.send(manualCommand);

                                                const result = {
                                                    manual: await manualData.Body?.transformToString(),
                                                    description: await descriptionData.Body?.transformToString(),
                                                };
                                                setResponseData(result);
                                                showSnackbar("マニュアルが正常に生成されました", 'success');
                                            }
                                        } catch (s3Error) {
                                            const message = s3Error instanceof Error ? s3Error.message : String(s3Error);
                                            showSnackbar(`生成されたファイルの読み込みに失敗しました: ${message}`, 'error');
                                        }
                                    } else if (parsedOutput && parsedOutput.success === false) {
                                        // 失敗時：エラーメッセージを表示
                                        const errorMessage = parsedOutput.message || "マニュアル生成中にエラーが発生しました。";
                                        showSnackbar(errorMessage, 'error');
                                        setResponseData({
                                            manual: `## エラーが発生しました\n\n**エラーメッセージ:** ${errorMessage}\n\n処理を再試行してください。`,
                                            description: "",
                                            error: true
                                        });
                                    }
                                } catch (parseError) {
                                    const message = parseError instanceof Error ? parseError.message : String(parseError);
                                    showSnackbar(`出力の解析に失敗しました: ${message}`, 'error');
                                }
                            }
                        } else if (status === "FAILED" || status === "TIMED_OUT" || status === "ABORTED") {
                            // エラー時
                            const errorOutput = response.data.output;
                            let errorMessage = "マニュアル生成中にエラーが発生しました。";

                            if (errorOutput && errorOutput !== "undefined" && errorOutput !== "null") {
                                try {
                                    const parsedError = JSON.parse(errorOutput);
                                    errorMessage = parsedError.message || parsedError.error || errorMessage;
                                } catch (parseError) {
                                    errorMessage = `エラー詳細: ${errorOutput}`;
                                }
                            }

                            showSnackbar(errorMessage, 'error');
                            setResponseData({
                                manual: `## エラーが発生しました\n\n**ステータス:** ${status}\n\n**エラーメッセージ:** ${errorMessage}\n\n処理を再試行してください。`,
                                description: "",
                                error: true
                            });
                        } else {
                            // その他のステータス
                            const unknownMessage = `処理が予期しない状態で終了しました (${status})`;
                            showSnackbar(unknownMessage, 'warning');
                            setResponseData({
                                manual: `## 処理が予期しない状態で終了しました\n\n**ステータス:** ${status}\n\n処理を再試行してください。`,
                                description: "",
                                error: true
                            });
                        }
                        return;
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    showSnackbar(`ステップ関数のステータス取得に失敗しました: ${message}`, 'error');
                    clearInterval(interval);
                    setLoading(false);
                }

                pollingCount++;
            }, 5000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [executionArn]);

    // Parse response data
    useEffect(() => {
        if (!responseData) {
            return;
        }
        if (responseData?.description) {
            setData(parseDescription(responseData.description));
        }
        let _manual = responseData?.manual;
        if (_manual && typeof _manual === 'string') {
            if (_manual.startsWith("```markdown\n")) {
                _manual = _manual.slice(12);
            }
            if (_manual.endsWith("```")) {
                _manual = _manual.slice(0, -3);
            }
        }

        setManual(_manual);
    }, [responseData]);

    return {
        loading,
        responseData,
        data,
        manual,
        deleteOpen,
        successDialogOpen,
        customPrompt,
        customPromptModalOpen,
        example_prompt,
        snackbarOpen,
        snackbarMessage,
        snackbarSeverity,
        handleClick,
        handleRetryWithReencode,
        handleReadExistingData,
        handleDeleteClickOpen,
        handleDeleteClose,
        handleDeleteData,
        handleDataChange,
        handleSnackbarClose,
        setManual,
        setCustomPrompt,
        setCustomPromptModalOpen,
        setSuccessDialogOpen,
    };
};
