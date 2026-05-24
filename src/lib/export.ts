const createTimestamp = () =>
  new Date().toISOString().replace(/:/g, "-").replace(/\./g, "-");

export const downloadJson = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
};

export const createPageExportName = (title: string) =>
  `${title.trim().replace(/\s+/g, "-") || "page"}-${createTimestamp()}.json`;

export const createWorkspaceExportName = () =>
  `local-notion-workspace-${createTimestamp()}.json`;
