const versionEnvVarKeys = [
  "NEXT_PUBLIC_APP_VERSION",
  "NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA",
  "VERCEL_GIT_COMMIT_SHA",
  "NEXT_PUBLIC_GIT_COMMIT_SHA",
  "GIT_COMMIT_SHA",
  "COMMIT_REF",
  "SOURCE_VERSION",
];

const timestampEnvVarKeys = [
  "NEXT_PUBLIC_BUILD_TIMESTAMP",
  "VERCEL_GIT_COMMIT_DATE",
  "NEXT_PUBLIC_VERCEL_GIT_COMMIT_DATE",
  "BUILD_TIMESTAMP",
  "BUILD_TIME",
  "SOURCE_VERSION_TIMESTAMP",
];

function readFirstEnvValue(keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function parseTimestamp(rawValue: string | undefined): Date | undefined {
  if (!rawValue) {
    return undefined;
  }

  const numeric = Number(rawValue);
  if (!Number.isNaN(numeric)) {
    if (rawValue.length === 10) {
      return new Date(numeric * 1000);
    }
    if (rawValue.length === 13) {
      return new Date(numeric);
    }
    return new Date(numeric);
  }

  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
}

function formatTimestamp(date: Date | undefined): string | undefined {
  if (!date) {
    return undefined;
  }

  const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
    timeZoneName: "short",
  });

  return formatter.format(date);
}

function createDisplayVersion(version: string): string {
  const trimmed = version.trim();
  if (trimmed.length <= 12) {
    return trimmed;
  }
  return `${trimmed.slice(0, 7)}…`;
}

export type BuildInfo = {
  version: string;
  displayVersion: string;
  rawTimestamp?: string;
  timestamp?: Date;
  formattedTimestamp?: string;
};

export function getBuildInfo(): BuildInfo {
  const version = readFirstEnvValue(versionEnvVarKeys) ?? "dev-local";
  const rawTimestamp = readFirstEnvValue(timestampEnvVarKeys);
  const timestamp = parseTimestamp(rawTimestamp);
  const formattedTimestamp = formatTimestamp(timestamp);

  return {
    version,
    displayVersion: createDisplayVersion(version),
    rawTimestamp,
    timestamp,
    formattedTimestamp,
  };
}
