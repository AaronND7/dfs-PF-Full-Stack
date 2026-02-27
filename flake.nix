{
  description = "Vue + Node + Postgres dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };

        nodejs = pkgs.nodejs_20; # Change if you need another version
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            # Node / Frontend
            nodejs
            nodePackages.pnpm
            nodePackages.yarn

            # Vue tooling helpers
            nodePackages.typescript
            nodePackages.typescript-language-server
            nodePackages.eslint
            nodePackages.prettier

            # Database
            postgresql_16
            pgcli        # nice CLI for Postgres
            libpq        # headers/libs for node pg bindings

            # General dev stuff
            git
            gnumake
            openssl
            pkg-config
            jq
          ];

          shellHook = ''
            echo "🚀 Vue + Node + Postgres dev shell ready"

            export NODE_ENV=development
            export PGDATA=$PWD/.pgdata
            export PGHOST=$PWD/.pgsocket
            export PGPORT=5432
            export PGUSER=postgres
            mkdir "$PGHOST"
            
            export PATH="$PWD/scripts:$PATH"

            if [ ! -d "$PGDATA" ]; then
              echo "📦 Initializing local Postgres cluster in .pgdata"
            initdb -D "$PGDATA" -U postgres -A trust >/dev/null
            fi
            echo "🛠 Dev shell ready"
            echo "DB commands:"
            echo "  db-start   → start database"
            echo "  db-stop    → stop database"
            echo "  db-reset   → wipe & recreate"
            echo "  db-psql    → open SQL shell"
            echo "  db-seed    → run schema/seed"
            '';
        };
      });
}
