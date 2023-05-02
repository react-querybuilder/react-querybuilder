import * as React from 'react';
import { useContext, useMemo } from 'react';
import { QueryBuilderContext } from '../components';
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
    const classnamesObject = useMemo(
      () =>
        compatClassnames
          ? {
              controlClassnames: mergeClassnames(
                rqbContext.controlClassnames,
                props.controlClassnames,
                compatClassnames
              ),
            }
          : {},
      [props.controlClassnames, rqbContext.controlClassnames]
    );
    const newContextProps = useMemo(
      (): QueryBuilderContextProps => ({
        ...rqbContext,
        ...classnamesObject,
        controlElements: {
          ...rqbContext.controlElements,
          ...compatElements,
          ...props.controlElements,
        },
      }),
      [classnamesObject, props.controlElements, rqbContext]
    );

    return (
      <QueryBuilderContext.Provider value={newContextProps} key={key}>
        {props.children}
      </QueryBuilderContext.Provider>
    );
  };
