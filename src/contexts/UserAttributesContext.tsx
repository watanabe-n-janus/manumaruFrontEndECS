import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { getCurrentUser, getUserFromToken, getTokensFromStorage } from '../utils/cognitoAuth';

type UserAttributes = Partial<Record<string, string>>;

interface UserAttributesContextValue {
    email: string;
    attributes: UserAttributes;
    loading: boolean;
    error?: string;
    refresh: () => Promise<void>;
}

const defaultContextValue: UserAttributesContextValue = {
    email: '',
    attributes: {},
    loading: false,
    refresh: async () => undefined,
};

const UserAttributesContext = createContext<UserAttributesContextValue>(defaultContextValue);

export const UserAttributesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const mountedRef = useRef(true);
    const [email, setEmail] = useState('');
    const [attributes, setAttributes] = useState<UserAttributes>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();

    const resetState = useCallback(() => {
        setEmail('');
        setAttributes({});
        setError(undefined);
    }, []);

    const loadAttributes = useCallback(async () => {
        if (!mountedRef.current) {
            return;
        }

        setLoading(true);
        console.log('🔄 UserAttributesContext: Loading user attributes...');
        try {
            // ユーザーが存在するか確認
            const user = await getCurrentUser();
            console.log('👤 UserAttributesContext: Current user:', user);
            if (!mountedRef.current) {
                return;
            }
            
            if (!user) {
                console.log('❌ UserAttributesContext: No user found');
                resetState();
                return;
            }

            // ユーザー属性を取得（トークンから）
            console.log('📥 UserAttributesContext: Getting attributes from token...');
            try {
                const tokens = getTokensFromStorage();
                if (tokens) {
                    const userFromToken = getUserFromToken(tokens.idToken);
                    const fetchedAttributes = userFromToken.attributes || {};
                    
                    // デバッグ: トークンのペイロードを確認
                    try {
                        const payload = JSON.parse(atob(tokens.idToken.split('.')[1]));
                        console.log('🔍 ID Token Payload:', {
                            email: payload.email,
                            'cognito:username': payload['cognito:username'],
                            sub: payload.sub,
                            allKeys: Object.keys(payload),
                        });
                    } catch (e) {
                        console.error('❌ Token payload parse error:', e);
                    }
                    
                    console.log('📋 UserAttributesContext: Fetched attributes:', fetchedAttributes);
                    console.log('📋 UserAttributesContext: Email from attributes:', fetchedAttributes.email);
                    console.log('📋 UserAttributesContext: Username:', user.username);
                    
                    if (!mountedRef.current) {
                        return;
                    }
                    setAttributes(fetchedAttributes);
                    
                    // メールアドレスの取得を優先順位付きで行う
                    // トークンのペイロードから直接emailを取得
                    try {
                        const payload = JSON.parse(atob(tokens.idToken.split('.')[1]));
                        const emailValue = payload.email || 
                                         fetchedAttributes.email || 
                                         fetchedAttributes['cognito:email'] || 
                                         user.username || 
                                         '';
                        setEmail(emailValue);
                        console.log('✅ UserAttributesContext: Email set to:', emailValue);
                        console.log('✅ UserAttributesContext: Final email value:', emailValue);
                        console.log('✅ UserAttributesContext: Email from payload:', payload.email);
                    } catch (e) {
                        console.error('❌ Failed to parse token for email:', e);
                        const emailValue = fetchedAttributes.email || 
                                         fetchedAttributes['cognito:email'] || 
                                         user.username || 
                                         '';
                        setEmail(emailValue);
                        console.log('✅ UserAttributesContext: Email (fallback) set to:', emailValue);
                    }
                    setError(undefined);
                } else {
                    throw new Error('トークンが見つかりません');
                }
            } catch (attrErr) {
                console.error('❌ UserAttributesContext: 属性取得に失敗:', attrErr);
                console.error('❌ Error details:', JSON.stringify(attrErr, null, 2));
                // email属性がない場合でもusernameを使用
                console.log('⚠️ Using username as fallback');
                const fallbackEmail = user.username || '';
                setEmail(fallbackEmail);
                console.log('✅ UserAttributesContext: Email (fallback) set to:', fallbackEmail);
            }
        } catch (err) {
            console.error('❌ UserAttributesContext: ユーザー属性の取得に失敗しました', err);
            console.error('❌ Error details:', JSON.stringify(err, null, 2));
            if (!mountedRef.current) {
                return;
            }
            resetState();
            const message = err instanceof Error ? err.message : 'ユーザー属性の取得に失敗しました';
            setError(message);
        } finally {
            if (!mountedRef.current) {
                return;
            }
            setLoading(false);
        }
    }, [resetState]);

    useEffect(() => {
        mountedRef.current = true;
        loadAttributes();
        return () => {
            mountedRef.current = false;
        };
    }, [loadAttributes]);

    const value = useMemo<UserAttributesContextValue>(
        () => ({
            email,
            attributes,
            loading,
            error,
            refresh: loadAttributes,
        }),
        [email, attributes, loading, error, loadAttributes],
    );

    return (
        <UserAttributesContext.Provider value={value}>
            {children}
        </UserAttributesContext.Provider>
    );
};

export const useUserAttributes = (): UserAttributesContextValue => {
    return useContext(UserAttributesContext);
};

export const useUserEmail = (): string => {
    const { email } = useUserAttributes();
    return email;
};

