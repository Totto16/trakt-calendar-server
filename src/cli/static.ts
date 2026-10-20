import path from "node:path"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs"


async function moveFiles(rootDir: string, sub_path: string | null): Promise<void> {
    const originDir = sub_path ? path.join(rootDir, sub_path) : rootDir
    const destFolder = sub_path ? path.join(rootDir, "dist", sub_path) : path.join(rootDir, "dist")

    const files = (await readdir(originDir))
        .filter((file) => file.endsWith(".html") || file.endsWith(".css"))

    if (!existsSync(destFolder)) {
        await mkdir(destFolder, { recursive: true })
    }

    await Promise.all(files.map(async (file) => {
        const content = await readFile(
            path.join(originDir, file),
            "utf8"
        );


        await writeFile(path.join(destFolder, file), content)
    }))

}



async function main(): Promise<void> {

    const rootDir = path.join(__dirname, "..", "..", "..");


    await Promise.all([moveFiles(rootDir, "static"), moveFiles(rootDir, "static/v1"), moveFiles(rootDir, "static/v2")])



}



void main()
