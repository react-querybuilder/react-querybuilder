/// <reference types="react" />
import { NameAndLabel } from '../../types';
declare type Options = NameAndLabel & {
    id: string;
};
export interface ValueSelectorProps {
    value?: string;
    options: Options[];
    className?: string;
    handleOnChange: (val: string) => void;
    title?: string;
}
declare const ValueSelector: (props: ValueSelectorProps) => JSX.Element;
export default ValueSelector;
