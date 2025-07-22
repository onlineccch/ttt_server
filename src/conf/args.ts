import commandLineArgs, { OptionDefinition } from "command-line-args";

const optDef: OptionDefinition[] = [
  {
    name: "port",
    type: Number,
    alias: "p",
  },
];

export const optSettings = commandLineArgs(optDef);
