import type { ComponentType, ReactNode } from 'react';
import type { FullOption, ValueEditorProps } from 'react-querybuilder';
import type { RelativeDateTimeAnchor, RelativeDateTimeUnit, RQBDateTimeLibraryAPI } from '../types';

/**
 * Customizable content/labels for the absolute/relative mode toggle rendered by
 * {@link toggleModeController}. The default glyphs come from CSS pseudo-elements, so
 * `absoluteContent`/`relativeContent` are only needed to override them (e.g. to render
 * an icon component or localized text).
 */
export interface RelativeDateTimeToggleLabels {
  /** Accessible label (`aria-label`) for the toggle button. */
  label?: string;
  /** Tooltip shown while in absolute mode (clicking switches to relative). */
  absoluteTitle?: string;
  /** Tooltip shown while in relative mode (clicking switches to absolute). */
  relativeTitle?: string;
  /** Custom content rendered while in absolute mode. Defaults to a CSS glyph. */
  absoluteContent?: ReactNode;
  /** Custom content rendered while in relative mode. Defaults to a CSS glyph. */
  relativeContent?: ReactNode;
}

/**
 * Props passed to a {@link RelativeDateTimeModeController}'s `ModeControl` component —
 * the affordance (e.g. a toggle button) that switches a rule between absolute and
 * relative date/time entry.
 */
export interface RelativeDateTimeModeControlProps {
  /** Whether the rule is currently in relative mode. */
  isRelative: boolean;
  /** Switches the rule between absolute and relative mode. */
  setMode: (mode: 'absolute' | 'relative') => void;
  /** The value editor's schema (for theme-aware rendering). */
  schema: ValueEditorProps['schema'];
  /** Whether the control is disabled. */
  disabled?: boolean;
  /** Class name applied to the control. */
  className?: string;
  /** Title/tooltip from the value editor (fallback when labels omit titles). */
  title?: string;
  /** Test ID from the value editor. */
  testID?: string;
  /** Resolved toggle labels (merged with defaults). */
  labels: Required<RelativeDateTimeToggleLabels>;
}

/**
 * A pluggable strategy that governs how a user switches between absolute and relative
 * date/time entry in the {@link RelativeDateTimeValueEditor}. The stored value shape is
 * unaffected — a controller only decides the current mode and (optionally) renders an
 * affordance to change it.
 *
 * Ships with {@link toggleModeController} (the zero-config default); build an
 * operator-driven controller with {@link createOperatorModeController}, or supply a custom
 * object to fully control the UX.
 */
export interface RelativeDateTimeModeController {
  /** Derives the current mode from the rule (its operator and/or value). */
  isRelative: (props: ValueEditorProps) => boolean;
  /**
   * Optional affordance rendered inside the editor to switch modes. Omit it (as the
   * operator-driven controller does) when the mode is selected elsewhere, e.g. via the
   * operator selector.
   */
  ModeControl?: ComponentType<RelativeDateTimeModeControlProps>;
}

/**
 * Configuration for the {@link RelativeDateTimeValueEditor}, supplied as props to
 * {@link QueryBuilderDateTime} (or via the relative date/time config context). Every
 * field is optional; omitting all of them yields the zero-config toggle experience.
 */
export interface RelativeDateTimeEditorConfig {
  /** Strategy for switching between absolute and relative modes. Defaults to {@link toggleModeController}. */
  modeController?: RelativeDateTimeModeController;
  /** Anchor (reference-point) options. Defaults to {@link defaultRelativeDateTimeAnchors}. */
  anchors?: FullOption<RelativeDateTimeAnchor>[];
  /** Unit options. Defaults to {@link defaultRelativeDateTimeUnits}. */
  units?: FullOption<RelativeDateTimeUnit>[];
  /** Content/labels for the absolute/relative toggle. */
  toggleLabels?: RelativeDateTimeToggleLabels;
  /**
   * Date/time library adapter used by the value editor to parse/validate the rule value
   * for the native date input. Defaults to the plain JavaScript adapter. Pass the adapter
   * matching your chosen entry point (e.g. from `@react-querybuilder/datetime/luxon`) so the
   * editor interprets values consistently with the rule processors.
   */
  dateTimeAPI?: RQBDateTimeLibraryAPI;
}

/**
 * Maps operator names that are used only to _signal_ relative mode (see
 * {@link createOperatorModeController}) to the real comparison operator that should be used
 * when exporting via `formatQuery`. Supplied through `context.relativeOperatorMap`. Operators
 * not present in the map are exported unchanged.
 *
 * @example
 * ```ts
 * formatQuery(query, {
 *   format: 'sql',
 *   ruleProcessor: datetimeRuleProcessorSQL,
 *   context: { relativeOperatorMap: { relativeEq: '=' } },
 * });
 * ```
 */
export type RelativeOperatorMap = Record<string, string>;
