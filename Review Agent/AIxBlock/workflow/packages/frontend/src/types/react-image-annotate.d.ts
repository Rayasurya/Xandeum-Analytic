declare module 'react-image-annotate' {
    interface ReactImageAnnotateProps {
        labelImages?: boolean;
        regionClsList?: string[];
        regionTagList?: string[];
        images?: Array<{
            src: string;
            name: string;
            regions: any[];
        }>;
        onExit?: (annotate: any) => void;
    }

    const ReactImageAnnotate: React.FC<ReactImageAnnotateProps>;
    export default ReactImageAnnotate;
}
