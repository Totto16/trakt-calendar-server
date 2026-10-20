import path from "node:path"
import { readdir, readFile, writeFile } from "node:fs/promises";



async function main(): Promise<void> {

    const rootDir = path.join(__dirname, "..", "..", "..");


    const files = (await readdir(rootDir))
        .filter((file) => file.endsWith(".html"))
        .sort();

    await Promise.all(files.map(async (file) => {
        const content = await readFile(
            path.join(rootDir, file),
            "utf8"
        );
        await writeFile(path.join(rootDir, "dist", file), content)
    }))




}



void main()
