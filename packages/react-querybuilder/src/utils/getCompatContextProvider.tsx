import { useContext } from 'react';
import { QueryBuilderContext } from '../QueryBuilderContext';
import type { QueryBuilderContextProps, QueryBuilderContextProvider } from '../types';
import { mergeClassnames } from './mergeClassnames';

export type GetCompatContextProviderProps = Pick<
  QueryBuilderContextProps,
  'controlClassnames' | 'controlElements'
> & { key: string };

export const getCompatContextProvider =
  ({
    key,
    controlClassnames: compatClassnames,
    controlElements: compatElements,
  }: GetCompatContextProviderProps): QueryBuilderContextProvider =>
  props => {
    const rqbContext = useContext(QueryBuilderContext);
    const classnamesObject = compatClassnames
      ? {
          controlClassnames: mergeClassnames(
            rqbContext.controlClassnames,
            props.controlClassnames,
            compatClassnames
          ),
        }
      : {};
    const newContextProps: QueryBuilderContextProps = {
      ...rqbContext,
      ...classnamesObject,
      controlElements: {
        ...rqbContext.controlElements,
        ...compatElements,
        ...props.controlElements,
      },
    };

    return (
      <QueryBuilderContext.Provider value={newContextProps} key={key}>
        {props.children}
      </QueryBuilderContext.Provider>
    );
  };
