# Snapshot file
# Unset all aliases to avoid conflicts with functions
# Functions
gawklibpath_append () 
{ 
    [ -z "$AWKLIBPATH" ] && AWKLIBPATH=`gawk 'BEGIN {print ENVIRON["AWKLIBPATH"]}'`;
    export AWKLIBPATH="$AWKLIBPATH:$*"
}
gawklibpath_default () 
{ 
    unset AWKLIBPATH;
    export AWKLIBPATH=`gawk 'BEGIN {print ENVIRON["AWKLIBPATH"]}'`
}
gawklibpath_prepend () 
{ 
    [ -z "$AWKLIBPATH" ] && AWKLIBPATH=`gawk 'BEGIN {print ENVIRON["AWKLIBPATH"]}'`;
    export AWKLIBPATH="$*:$AWKLIBPATH"
}
gawkpath_append () 
{ 
    [ -z "$AWKPATH" ] && AWKPATH=`gawk 'BEGIN {print ENVIRON["AWKPATH"]}'`;
    export AWKPATH="$AWKPATH:$*"
}
gawkpath_default () 
{ 
    unset AWKPATH;
    export AWKPATH=`gawk 'BEGIN {print ENVIRON["AWKPATH"]}'`
}
gawkpath_prepend () 
{ 
    [ -z "$AWKPATH" ] && AWKPATH=`gawk 'BEGIN {print ENVIRON["AWKPATH"]}'`;
    export AWKPATH="$*:$AWKPATH"
}

# setopts 3
set -o braceexpand
set -o hashall
set -o interactive-comments

# aliases 0

# exports 38
declare -x CODEX_HOME="/home/m_srnic/ece493/group_project/ECE493Group19/.codex"
declare -x CODEX_MANAGED_BY_NPM="1"
declare -x COLORTERM="truecolor"
declare -x DISPLAY=":0"
declare -x GIT_ASKPASS="/home/m_srnic/.vscode-server/bin/0870c2a0c7c0564e7631bfed2675573a94ba4455/extensions/git/dist/askpass.sh"
declare -x HOME="/home/m_srnic"
declare -x HOSTTYPE="x86_64"
declare -x LANG="C.UTF-8"
declare -x LESSCLOSE="/usr/bin/lesspipe %s %s"
declare -x LESSOPEN="| /usr/bin/lesspipe %s"
declare -x LOGNAME="m_srnic"
declare -x LS_COLORS="rs=0:di=01;34:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:mi=00:su=37;41:sg=30;43:ca=30;41:tw=30;42:ow=34;42:st=37;44:ex=01;32:*.tar=01;31:*.tgz=01;31:*.arc=01;31:*.arj=01;31:*.taz=01;31:*.lha=01;31:*.lz4=01;31:*.lzh=01;31:*.lzma=01;31:*.tlz=01;31:*.txz=01;31:*.tzo=01;31:*.t7z=01;31:*.zip=01;31:*.z=01;31:*.dz=01;31:*.gz=01;31:*.lrz=01;31:*.lz=01;31:*.lzo=01;31:*.xz=01;31:*.zst=01;31:*.tzst=01;31:*.bz2=01;31:*.bz=01;31:*.tbz=01;31:*.tbz2=01;31:*.tz=01;31:*.deb=01;31:*.rpm=01;31:*.jar=01;31:*.war=01;31:*.ear=01;31:*.sar=01;31:*.rar=01;31:*.alz=01;31:*.ace=01;31:*.zoo=01;31:*.cpio=01;31:*.7z=01;31:*.rz=01;31:*.cab=01;31:*.wim=01;31:*.swm=01;31:*.dwm=01;31:*.esd=01;31:*.jpg=01;35:*.jpeg=01;35:*.mjpg=01;35:*.mjpeg=01;35:*.gif=01;35:*.bmp=01;35:*.pbm=01;35:*.pgm=01;35:*.ppm=01;35:*.tga=01;35:*.xbm=01;35:*.xpm=01;35:*.tif=01;35:*.tiff=01;35:*.png=01;35:*.svg=01;35:*.svgz=01;35:*.mng=01;35:*.pcx=01;35:*.mov=01;35:*.mpg=01;35:*.mpeg=01;35:*.m2v=01;35:*.mkv=01;35:*.webm=01;35:*.webp=01;35:*.ogm=01;35:*.mp4=01;35:*.m4v=01;35:*.mp4v=01;35:*.vob=01;35:*.qt=01;35:*.nuv=01;35:*.wmv=01;35:*.asf=01;35:*.rm=01;35:*.rmvb=01;35:*.flc=01;35:*.avi=01;35:*.fli=01;35:*.flv=01;35:*.gl=01;35:*.dl=01;35:*.xcf=01;35:*.xwd=01;35:*.yuv=01;35:*.cgm=01;35:*.emf=01;35:*.ogv=01;35:*.ogx=01;35:*.aac=00;36:*.au=00;36:*.flac=00;36:*.m4a=00;36:*.mid=00;36:*.midi=00;36:*.mka=00;36:*.mp3=00;36:*.mpc=00;36:*.ogg=00;36:*.ra=00;36:*.wav=00;36:*.oga=00;36:*.opus=00;36:*.spx=00;36:*.xspf=00;36:"
declare -x NAME="MARKO-OMEN"
declare -x NVM_BIN="/home/m_srnic/.nvm/versions/node/v23.11.0/bin"
declare -x NVM_CD_FLAGS=""
declare -x NVM_DIR="/home/m_srnic/.nvm"
declare -x NVM_INC="/home/m_srnic/.nvm/versions/node/v23.11.0/include/node"
declare -x PATH="/home/m_srnic/.local/bin:/home/m_srnic/ece493/group_project/ECE493Group19/.codex/tmp/arg0/codex-arg0P4e3hE:/home/m_srnic/.nvm/versions/node/v23.11.0/lib/node_modules/@openai/codex/node_modules/@openai/codex-linux-x64/vendor/x86_64-unknown-linux-musl/path:/home/m_srnic/.vscode-server/bin/0870c2a0c7c0564e7631bfed2675573a94ba4455/bin/remote-cli:/home/m_srnic/.local/bin:/home/m_srnic/.local/bin:/home/m_srnic/.nvm/versions/node/v23.11.0/bin:/home/m_srnic/.cargo/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/usr/lib/wsl/lib:/mnt/c/Users/XxSma/AppData/Local/Programs/Microsoft VS Code:/mnt/c/Python312/Scripts/:/mnt/c/Python312/:/mnt/c/Program Files/Common Files/Oracle/Java/javapath:/mnt/c/Program Files (x86)/Razer Chroma SDK/bin:/mnt/c/Program Files/Razer Chroma SDK/bin:/mnt/c/Program Files (x86)/Razer/ChromaBroadcast/bin:/mnt/c/Program Files/Razer/ChromaBroadcast/bin:/mnt/c/Program Files (x86)/Common Files/Oracle/Java/javapath:/mnt/c/windows/system32:/mnt/c/windows:/mnt/c/windows/System32/Wbem:/mnt/c/windows/System32/WindowsPowerShell/v1.0/:/mnt/c/windows/System32/OpenSSH/:/mnt/c/Program Files (x86)/NVIDIA Corporation/PhysX/Common:/mnt/c/Program Files/NVIDIA Corporation/NVIDIA NvDLISR:/mnt/c/WINDOWS/system32:/mnt/c/WINDOWS:/mnt/c/WINDOWS/System32/Wbem:/mnt/c/WINDOWS/System32/WindowsPowerShell/v1.0/:/mnt/c/WINDOWS/System32/OpenSSH/:/mnt/c/Program Files/MATLAB/R2021b/bin:/mnt/c/WINDOWS/system32/config/systemprofile/AppData/Local/Microsoft/WindowsApps:/mnt/c/Program Files/Git/cmd:/mnt/c/Program Files/Java/jdk-17:/mnt/c/ProgramData/chocolatey/bin:/mnt/c/Program Files/HP/HP One Agent:/mnt/c/WINDOWS/system32:/mnt/c/WINDOWS:/mnt/c/WINDOWS/System32/Wbem:/mnt/c/WINDOWS/System32/WindowsPowerShell/v1.0/:/mnt/c/WINDOWS/System32/OpenSSH/:/mnt/c/Program Files/Microsoft SQL Server/150/Tools/Binn/:/mnt/c/Program Files/Microsoft SQL Server/Client SDK/ODBC/170/Tools/Binn/:/mnt/c/Program Files/dotnet/:/mnt/c/Program Files (x86)/Windows Kits/10/Windows Performance Toolkit/:/mnt/c/Program Files/nodejs/:/mnt/c/Users/XxSma/.cargo/bin:/mnt/c/Users/XxSma/AppData/Local/Programs/Python/Python310/Scripts/:/mnt/c/Users/XxSma/AppData/Local/Programs/Python/Python310/:/mnt/c/Users/XxSma/AppData/Local/Microsoft/WindowsApps:/mnt/c/Program Files/Multipass/bin:/mnt/c/Users/XxSma/AppData/Local/GitHubDesktop/bin:/mnt/c/Users/XxSma/AppData/Local/Programs/Microsoft VS Code/bin:/mnt/c/Program Files (x86)/sqlite-tools-win-x64-3460100/sqlite3.exe:/mnt/c/Program Files/JetBrains/PyCharm 2024.2.3/bin:/mnt/c/Users/XxSma/.dotnet/tools:/mnt/c/Users/XxSma/AppData/Roaming/npm:/snap/bin"
declare -x PULSE_SERVER="unix:/mnt/wslg/PulseServer"
declare -x SHELL="/bin/bash"
declare -x SHLVL="2"
declare -x TERM="xterm-256color"
declare -x TERM_PROGRAM="vscode"
declare -x TERM_PROGRAM_VERSION="1.110.0"
declare -x USER="m_srnic"
declare -x VSCODE_GIT_ASKPASS_EXTRA_ARGS=""
declare -x VSCODE_GIT_ASKPASS_MAIN="/home/m_srnic/.vscode-server/bin/0870c2a0c7c0564e7631bfed2675573a94ba4455/extensions/git/dist/askpass-main.js"
declare -x VSCODE_GIT_ASKPASS_NODE="/home/m_srnic/.vscode-server/bin/0870c2a0c7c0564e7631bfed2675573a94ba4455/node"
declare -x VSCODE_GIT_IPC_HANDLE="/mnt/wslg/runtime-dir/vscode-git-1d16f03000.sock"
declare -x VSCODE_IPC_HOOK_CLI="/mnt/wslg/runtime-dir/vscode-ipc-801ae54a-7942-4396-b8d3-a392bc589ede.sock"
declare -x VSCODE_PYTHON_AUTOACTIVATE_GUARD="1"
declare -x WAYLAND_DISPLAY="wayland-0"
declare -x WSL2_GUI_APPS_ENABLED="1"
declare -x WSLENV="VSCODE_WSL_EXT_LOCATION/up"
declare -x WSL_DISTRO_NAME="Ubuntu-22.04"
declare -x WSL_INTEROP="/run/WSL/2670_interop"
declare -x XDG_DATA_DIRS="/usr/local/share:/usr/share:/var/lib/snapd/desktop"
declare -x XDG_RUNTIME_DIR="/mnt/wslg/runtime-dir"
