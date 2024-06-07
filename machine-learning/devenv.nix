{ pkgs, lib, config, inputs, ... }:

{

env = {
    # Add the required library to the environment
    LD_LIBRARY_PATH = "${pkgs.stdenv.cc.cc.lib}/lib:${pkgs.libGL}/lib:${pkgs.glib.out}/lib";

    # Create a Python environment with the required library
    PYTHONPATH = pkgs.python310.buildEnv.override {
      extraLibs = [
        pkgs.stdenv.cc.cc.lib # Include the required library
        pkgs.libGL
        pkgs.glib
      ];
    };
  };

  enterShell = ''
    source env/bin/activate
  '';

  # https://devenv.sh/tests/
  enterTest = ''
    echo "Running tests"
    git --version | grep "2.42.0"
  '';

  # https://devenv.sh/languages/
  languages.python.enable = true;

  # https://devenv.sh/pre-commit-hooks/
  # pre-commit.hooks.shellcheck.enable = true;

  # https://devenv.sh/processes/
  # processes.ping.exec = "ping example.com";

  # See full reference at https://devenv.sh/reference/options/
}
