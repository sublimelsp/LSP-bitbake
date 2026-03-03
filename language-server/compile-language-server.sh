#!/usr/bin/env bash

GITHUB_REPO_URL="https://github.com/yoctoproject/vscode-bitbake"
GITHUB_REPO_NAME=$(echo "${GITHUB_REPO_URL}" | command grep -oE '[^/]*$')

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_DIR="${SCRIPT_DIR}"
ORIG_SRC_DIR="${REPO_DIR}/${GITHUB_REPO_NAME}"
SRC_DIR="${REPO_DIR}/${GITHUB_REPO_NAME}/server"
DIST_DIR="${REPO_DIR}/bitbake-language-features/server"

echo ${SRC_DIR}
echo ${ORIG_SRC_DIR}

# -------- #
# clean up #
# -------- #

pushd "${REPO_DIR}" || exit

rm -rf \
    "${DIST_DIR}" \
    "package-lock.json" \
    "package.json" \
    --

popd || exit


# ------------------------- #
# download the source codes #
# ------------------------- #

pushd "${REPO_DIR}" || exit

echo 'Enter commit SHA, branch or tag (for example 2.1.0) to build'
read -rp 'SHA, branch or tag (default: main): ' ref

# use the "main" branch by default
if [ "${ref}" = "" ]; then
    ref="main"
fi

temp_zip="src-${ref}.zip"
curl -L "${GITHUB_REPO_URL}/archive/${ref}.zip" -o "${temp_zip}"
unzip -z "${temp_zip}" | tr -d '\r' > update-info.log
unzip "${temp_zip}"  # ignore errors as there are some special file names that cause them
rm -f "${temp_zip}" || exit
mv "${GITHUB_REPO_NAME}-"* "${GITHUB_REPO_NAME}"

popd || exit


# ------------ #
# prepare deps #
# ------------ #

pushd "$ORIG_SRC_DIR" || exit

npm run clean

npm install

npm run fetch

npm run compile

popd || exit

pushd "${SRC_DIR}" || exit

npm install --lockfile-version 2

popd || exit


# ------- #
# compile #
# ------- #

pushd "${SRC_DIR}" || exit

npm pack

popd || exit


# -------------------- #
# collect output files #
# -------------------- #

pushd "${REPO_DIR}" || exit

mkdir -p "${DIST_DIR}"

TGZ_FILE=$(find ${SRC_DIR} -maxdepth 1 -type f -name "*.tgz" | head -n 1)
echo $TGZ_FILE
tar -xvzf "${TGZ_FILE}" -C "${DIST_DIR}"
cp "${SRC_DIR}/package.json" .
cp "${SRC_DIR}/package-lock.json" .

popd || exit


# -------- #
# clean up #
# -------- #

pushd "${REPO_DIR}" || exit

rm -rf "${GITHUB_REPO_NAME}"

popd || exit
