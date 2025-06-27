import type { PropsWithChildren, ReactNode } from 'react';

// Mock for @hello-pangea/dnd to avoid import errors during development
export const DragDropContext = ({ children }: PropsWithChildren): ReactNode => children;
export const Draggable = () => null;
export const Droppable = () => null;
