export async function determineFileType(file: string, fileUrl: string): Promise<{
  fileType: string;
  fileContent?: string;
}> {
  const extension = file.split(".").pop()?.toLowerCase() || "";

  if ([
    "jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "tiff", "avif"
  ].includes(extension)) {
    return { fileType: "image" };
  }

  if (["pdf", "epub"].includes(extension)) {
    return { fileType: "pdf" };
  }

  if ([
    "mp4", "webm", "mov", "avi", "mkv", "flv", "m4v", "wmv", "3gp", "ogv"
  ].includes(extension)) {
    return { fileType: "video" };
  }

  if ([
    "mp3", "wav", "ogg", "flac", "aac", "m4a", "wma", "aiff", "alac", "mid", "midi"
  ].includes(extension)) {
    return { fileType: "audio" };
  }

  if (["zip", "rar", "tar", "gz", "bz2", "7z", "iso", "dmg", "pkg", "deb", "rpm", "exe", "app", "msi", "cab", "jar", "war", "ear", "whl", "whl.gz", "whl.bz2", "whl.zip", "whl.tar", "whl.gz.tar", "whl.bz2.tar", "whl.zip.tar"].includes(extension)) {
    return { fileType: "zip" };
  } 

  if ([
    "txt", "md", "markdown", "html", "htm", "css", "scss", "sass", "less",
    "js", "jsx", "ts", "tsx", "mjs", "cjs", "json", "xml", "yaml", "yml",
    "toml", "py", "rb", "php", "java", "c", "cpp", "cs", "go", "rs", "swift",
    "kt", "kts", "scala", "sh", "bash", "zsh", "fish", "env", "ini", "conf",
    "config", "svelte"
  ].includes(extension)) {
    try {
      const response = await fetch(fileUrl);
      const fileContent = await response.text();
      return { fileType: "text", fileContent };
    } catch (err) {
      console.error("Error fetching file content:", err);
      return { fileType: "text", fileContent: "Error loading file content" };
    }
  }

  return { fileType: "other" };
} 