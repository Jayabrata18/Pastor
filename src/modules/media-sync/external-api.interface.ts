export interface ExternalApiResponse {
    status: string;
    data: ExternalMediaItem[];
}

export interface ExternalMediaItem {
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
    author: string;
    categories: string[];
    language: string;
    explicit: boolean;
}