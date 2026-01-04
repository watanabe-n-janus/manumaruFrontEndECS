export interface CreateManualButtonProps {
    fileName: string | null;
    fileData: {
        manual_path?: string;
        description_path?: string;
        thumbnail_html_path?: string;
    } | null;
    onUploadComplete: () => void;
    manualLevel?: string;
    workContent?: string;
}

export interface VideoTimeDescription {
    video_time: string;
    description: string;
}
