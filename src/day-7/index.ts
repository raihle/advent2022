import { chunkList } from "../utils/chunk-list";
import { sum } from "../utils/sum";

type FileSystem = {
  items: Record<string, DirEnt>;
};

type DirEnt = Directory | File;

type Directory = {
  type: "dir";
  directories: string[];
  files: string[];
  totalSize?: number;
};

type File = {
  type: "file";
  size: number;
};

export async function test() {
  main([
    "$ cd /",
    "$ ls",
    "dir a",
    "14848514 b.txt",
    "8504156 c.dat",
    "dir d",
    "$ cd a",
    "$ ls",
    "dir e",
    "29116 f",
    "2557 g",
    "62596 h.lst",
    "$ cd e",
    "$ ls",
    "584 i",
    "$ cd ..",
    "$ cd ..",
    "$ cd d",
    "$ ls",
    "4060174 j",
    "8033020 d.log",
    "5626152 d.ext",
    "7214296 k",
  ]);
}

export async function main(input: string[]) {
  const fs = buildFileSystem(input);
  const smallDirectories = filter(
    fs,
    (entity) => entity.type == "dir" && entity.totalSize <= 100000
  );
  console.log(
    "A: ",
    sum(smallDirectories.map((name) => (fs.items[name] as Directory).totalSize))
  );
  const spaceToFree = 30000000 - (70000000 - calculateSize(fs, "/"));
  console.log(
    "B: ",
    filter(
      fs,
      (entity) => entity.type == "dir" && entity.totalSize >= spaceToFree
    )
      .map((path) => calculateSize(fs, path))
      .sort((a, b) => a - b)
  );
}

function buildFileSystem(input: string[]) {
  const commands = chunkList(input, (line) => line.startsWith("$"), true);
  const fileSystem: FileSystem = {
    items: {},
  };
  let cwd = [];
  for (const command of commands) {
    const [_, commandName, argument] = command[0].split(" ");
    switch (commandName) {
      case "cd":
        handleCd(cwd, argument);
        break;
      case "ls":
        handleLs(cwd, fileSystem, command.slice(1));
        break;
    }
  }
  calculateSize(fileSystem, "/");
  return fileSystem;
}

function calculateSize(fileSystem: FileSystem, path: string) {
  const entity: DirEnt = fileSystem.items[path];
  if (entity.type == "file") {
    return entity.size;
  } else if (entity.totalSize) {
    return entity.totalSize;
  } else {
    const directories = entity.directories;
    const files = entity.files;
    const size =
      sum(
        directories.map((dir) =>
          calculateSize(fileSystem, `${path}/${dir}`.replace("//", "/"))
        )
      ) +
      sum(
        files.map((file) =>
          calculateSize(fileSystem, `${path}/${file}`.replace("//", "/"))
        )
      );
    entity.totalSize = size;
    return size;
  }
}

function handleCd(cwd: string[], argument: string) {
  switch (argument) {
    case "/":
      cwd = [];
      break;
    case "..":
      cwd.pop();
      break;
    default:
      cwd.push(argument);
      break;
  }
}

function handleLs(cwd: string[], fileSystem: FileSystem, output: string[]) {
  const dirname = "/" + cwd.join("/");
  const directories = [];
  const files = [];
  for (const item of output) {
    const [size, name] = item.split(" ");
    if (size == "dir") {
      directories.push(name);
    } else {
      files.push(name);
      fileSystem.items[`${dirname}/${name}`.replace("//", "/")] = {
        type: "file",
        size: Number(size),
      };
    }
  }
  fileSystem.items[dirname] = {
    type: "dir",
    directories,
    files,
  };
}

function filter(fs: FileSystem, predicate: (entity: DirEnt) => boolean) {
  return Object.keys(fs.items).filter((name) => predicate(fs.items[name]));
}
