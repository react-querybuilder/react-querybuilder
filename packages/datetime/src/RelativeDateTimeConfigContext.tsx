import * as React from 'react';
import { createContext, useContext, useMemo } from 'react';
import type { FullOption } from 'react-querybuilder';
import {
  defaultRelativeDateTimeAnchors,
  defaultRelativeDateTimeToggleLabels,
  defaultRelativeDateTimeUnits,
} from './relativeDateTimeConstants';
import { toggleModeController } from './relativeDateTimeModeControllers';
import { rqbDateTimeLibraryAPI as defaultDateTimeAPI } from './rqbDateTimeLibraryAPI.dayjs';
import type {
  RelativeDateTimeAnchor,
  RelativeDateTimeEditorConfig,
  RelativeDateTimeModeController,
  RelativeDateTimeToggleLabels,
  RelativeDateTimeUnit,
  RQBDateTimeLibraryAPI,
} from './types';

/** Fully-resolved relative date/time editor config (no optional fields). */
export interface ResolvedRelativeDateTimeConfig {
  modeController: RelativeDateTimeModeController;
  anchors: FullOption<RelativeDateTimeAnchor>[];
  units: FullOption<RelativeDateTimeUnit>[];
  toggleLabels: Required<RelativeDateTimeToggleLabels>;
  dateTimeAPI: RQBDateTimeLibraryAPI;
}

/**
 * Carries {@link RelativeDateTimeEditorConfig} to the {@link RelativeDateTimeValueEditor}.
 * Provided by {@link QueryBuilderDateTime}; defaults apply when no provider is present.
 */
export const RelativeDateTimeConfigContext: React.Context<RelativeDateTimeEditorConfig> =
  createContext<RelativeDateTimeEditorConfig>({});

/** Reads the relative date/time editor config from context, merged with defaults. */
export const useRelativeDateTimeConfig = (): ResolvedRelativeDateTimeConfig => {
  const config = useContext(RelativeDateTimeConfigContext);
  return useMemo(
    () => ({
      modeController: config.modeController ?? toggleModeController,
      anchors: config.anchors ?? defaultRelativeDateTimeAnchors,
      units: config.units ?? defaultRelativeDateTimeUnits,
      toggleLabels: { ...defaultRelativeDateTimeToggleLabels, ...config.toggleLabels },
      dateTimeAPI: config.dateTimeAPI ?? defaultDateTimeAPI,
    }),
    [config]
  );
};
