import { Layer } from '../../../store/useStore';

export interface ElementCardProps {
    element: Layer;
    sectionId?: string;
    handleUpdate: (updates: Partial<Layer>) => void;
    permissions: any;
    isProtected: boolean;
}

export type CardComponent = React.FC<ElementCardProps>;
