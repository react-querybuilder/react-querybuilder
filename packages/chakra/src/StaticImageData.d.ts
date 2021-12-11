// https://github.com/vercel/next.js/issues/29788#issuecomment-988508632
type StaticImageData = {
  src: string;
  height: number;
  width: number;
  placeholder?: string;
};

declare module '*.gif' {
  const content: StaticImageData;
  export default content;
}
