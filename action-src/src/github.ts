import { Octokit } from '@octokit/core';
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods';

export interface GitContext {
    owner: string;
    repo: string;
}

export interface PullRequestRef extends GitContext {
    pull_number: number;
}

export async function getPullRequestFiles(git: Octokit, prRef: PullRequestRef): Promise<Set<string>> {
    const { owner, repo, pull_number } = prRef;
    const { rest } = restEndpointMethods(git);
    const commits = await rest.pulls.listCommits({ owner, repo, pull_number });

    return fetchFilesForCommits(git, prRef, commits.data.map((c) => c.sha).filter(isString));
}

function isString(s: string | unknown): s is string {
    return typeof s === 'string';
}

export async function fetchFilesForCommits(
    git: Octokit,
    context: GitContext,
    commitIds: string[],
): Promise<Set<string>> {
    const files: Set<string> = new Set();
    for await (const file of fetchFilesForCommitsX(git, context, commitIds)) {
        files.add(file);
    }
    return files;
}

async function* fetchFilesForCommitsX(
    git: Octokit,
    context: GitContext,
    commitIds: string[],
): AsyncIterableIterator<string> {
    const { owner, repo } = context;
    const { rest } = restEndpointMethods(git);
    for (const ref of commitIds) {
        const commit = await rest.repos.getCommit({ owner, repo, ref });
        const files = commit.data.files;
        if (!files) continue;
        for (const f of files) {
            if (f.filename) {
                yield f.filename;
            }
        }
    }
}
