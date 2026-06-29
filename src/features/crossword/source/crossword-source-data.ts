import { crosswordSourceDataSchema } from "@/features/crossword/source/crossword-source.schema";
import type {
  CrosswordSourceAuthoringState,
  CrosswordSourceDataEnvelope,
  CrosswordSourceImportMetadata,
  CrosswordSourceRow
} from "@/features/crossword/source/crossword-source.types";

const DEFAULT_IMPORT_METADATA: CrosswordSourceImportMetadata = {
  detectedHeaders: ["Clue", "Answer"],
  unknownHeaders: [],
  ignoredBlankRows: 0
};

const DEFAULT_AUTHORING_STATE: CrosswordSourceAuthoringState = {
  selectedRowIds: [],
  seed: "tara-admin-seed",
  completion: {
    title: "You did it",
    message: "Placeholder completion copy. Replace this when the final clue set is ready.",
    actionLabel: "Back home",
    actionHref: "/"
  },
  importMetadata: DEFAULT_IMPORT_METADATA
};

export function normalizeCrosswordSourceData(sourceData: unknown): CrosswordSourceDataEnvelope {
  const parsed = crosswordSourceDataSchema.parse(sourceData);

  if (Array.isArray(parsed)) {
    return {
      schemaVersion: 1,
      rows: parsed,
      authoring: {
        ...DEFAULT_AUTHORING_STATE,
        selectedRowIds: parsed
          .filter((row) => row.status === "complete")
          .map((row) => row.id)
      }
    };
  }

  return {
    schemaVersion: 1,
    rows: parsed.rows,
    authoring: parsed.authoring
      ? {
          ...DEFAULT_AUTHORING_STATE,
          ...parsed.authoring,
          completion: {
            ...DEFAULT_AUTHORING_STATE.completion,
            ...parsed.authoring.completion
          },
          importMetadata: {
            ...DEFAULT_IMPORT_METADATA,
            ...parsed.authoring.importMetadata
          }
        }
      : {
          ...DEFAULT_AUTHORING_STATE,
          selectedRowIds: parsed.rows
            .filter((row) => row.status === "complete")
            .map((row) => row.id)
        }
  };
}

export function createCrosswordSourceDataEnvelope({
  rows,
  authoring
}: {
  rows: CrosswordSourceRow[];
  authoring: CrosswordSourceAuthoringState;
}): CrosswordSourceDataEnvelope {
  return {
    schemaVersion: 1,
    rows,
    authoring: {
      ...authoring,
      importMetadata: {
        ...DEFAULT_IMPORT_METADATA,
        ...authoring.importMetadata
      }
    }
  };
}
