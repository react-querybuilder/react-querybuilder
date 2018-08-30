/// <reference types="react" />
import * as React from 'react';
export interface ActionElementProps {
    label?: string;
    className?: string;
    handleOnClick: (val: React.MouseEvent<HTMLButtonElement>) => void;
    title?: string;
}
declare function ActionElement(props: ActionElementProps): JSX.Element;
export default ActionElement;
