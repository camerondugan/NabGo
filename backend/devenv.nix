{ pkgs, lib, config, inputs, ... }:

{
  enterShell = ''
    edgedb ui
  '';

  packages = [
    pkgs.edgedb
  ];

  processes.edgedb-server.exec = "edgedb instance start nabgo-backend --foreground";

  # https://devenv.sh/tests/
  enterTest = ''
  '';

  # https://devenv.sh/services/
  # services.postgres.enable = true;

  # https://devenv.sh/languages/
  languages.go.enable = true;

  # https://devenv.sh/pre-commit-hooks/
  # pre-commit.hooks.shellcheck.enable = true;

  # https://devenv.sh/processes/
  # processes.ping.exec = "ping example.com";

  # See full reference at https://devenv.sh/reference/options/
}
