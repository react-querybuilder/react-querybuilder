/* eslint-disable @typescript-eslint/consistent-type-imports */
import type Button from '@mui/material/Button';
import type { ComponentPropsWithoutRef } from 'react';
import { useEffect, useState } from 'react';
import { ActionElement, ActionWithRulesProps } from 'react-querybuilder';
import { errorMaterialWithoutMUI } from './messages';

type MaterialActionProps = ActionWithRulesProps & ComponentPropsWithoutRef<typeof Button>;

type GetMaterialActionElementProps = {
  components: { Button: typeof Button };
};

let didWarnMaterialWithoutMUI = false;

const useMUI = () => {
  const [mui, setMUI] = useState<GetMaterialActionElementProps | null>(null);

  useEffect(() => {
    let didCancel = false;

    const getHook = async () => {
      const [muiButton] = await Promise.all([import('@mui/material/Button').catch(() => null)]);

      // istanbul ignore else
      if (!didCancel) {
        if (muiButton) {
          const Button = muiButton?.default;
          setMUI(() => ({ components: { Button } }));
        } else {
          // istanbul ignore else
          if (__RQB_DEV__ && !didWarnMaterialWithoutMUI) {
            console.error(errorMaterialWithoutMUI);
            didWarnMaterialWithoutMUI = true;
          }
        }
      }
    };

    if (!mui) {
      getHook();
    }

    return () => {
      didCancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return mui;
};

export const MaterialActionElement = (props: MaterialActionProps) => {
  const mui = useMUI();
  const key = mui ? 'theme' : 'no-theme';
  if (!mui) {
    return <ActionElement key={key} {...props} />;
  }

  const Component = getMaterialActionElement(mui);

  return <Component {...props} />;
};

export const getMaterialActionElement =
  ({ components: { Button } }: GetMaterialActionElementProps) =>
  ({
    className,
    handleOnClick,
    label,
    title,
    disabled,
    disabledTranslation,
    // Props that should not be in extraProps
    testID: _testID,
    rules: _rules,
    level: _level,
    path: _path,
    context: _context,
    validation: _validation,
    ...extraProps
  }: MaterialActionProps) =>
    (
      <Button
        variant="contained"
        color="secondary"
        className={className}
        title={disabledTranslation && disabled ? disabledTranslation.title : title}
        size="small"
        disabled={disabled && !disabledTranslation}
        onClick={e => handleOnClick(e)}
        {...extraProps}>
        {disabledTranslation && disabled ? disabledTranslation.label : label}
      </Button>
    );

MaterialActionElement.displayName = 'MaterialActionElement';
