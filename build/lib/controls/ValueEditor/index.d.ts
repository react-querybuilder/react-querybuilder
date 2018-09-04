/// <reference types="react" />
export interface ValueEditorProps {
    field: string;
    value: string;
    operator: string;
    handleOnChange: (val: string) => void;
    title: string;
}
declare const ValueEditor: (props: ValueEditorProps) => JSX.Element | null;
export default ValueEditor;
