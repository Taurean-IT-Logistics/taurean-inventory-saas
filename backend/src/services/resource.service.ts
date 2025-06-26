import path from "path";
import fs from "fs/promises";

const BASE_DIR = path.resolve(process.cwd(), "./");

const fetchResource = async (filePath: string): Promise<Buffer | null> => {
  try {
    const fullPath = path.join(BASE_DIR, filePath);

    const normalizedPath = path.resolve(fullPath);
    if (!normalizedPath.startsWith(BASE_DIR + path.sep)) {
      throw new Error("Invalid file path");
    }

    await fs.access(normalizedPath);
    return await fs.readFile(normalizedPath);
  } catch (error) {
    return null;
  }
};

export { fetchResource };
