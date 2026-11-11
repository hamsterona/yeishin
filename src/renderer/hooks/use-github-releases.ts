import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { APP_RELEASE_TAG_PREFIX, APP_REPO_API_URL } from '/@/shared/constants/brand';

export const GITHUB_RELEASES_URL = `${APP_REPO_API_URL}/releases`;
export const RELEASES_TO_FETCH = 30;

export interface GitHubRelease {
    body: null | string;
    name: null | string;
    prerelease: boolean;
    published_at: string;
    tag_name: string;
}

export function parseVersionFromTag(tagName: string): string {
    if (tagName.startsWith(APP_RELEASE_TAG_PREFIX))
        return tagName.slice(APP_RELEASE_TAG_PREFIX.length);
    return tagName.startsWith('v') ? tagName.slice(1) : tagName;
}

export function toTag(version: string): string {
    return `${APP_RELEASE_TAG_PREFIX}${parseVersionFromTag(version)}`;
}

export const useGithubReleasesList = (perPage = RELEASES_TO_FETCH) => {
    return useQuery({
        queryFn: async () => {
            const response = await axios.get<GitHubRelease[]>(GITHUB_RELEASES_URL, {
                params: { per_page: perPage },
            });
            return response.data;
        },
        queryKey: ['github-releases-list', perPage],
        retry: 2,
    });
};

export const useGithubLatestRelease = (options?: {
    refetchInterval?: number;
    refetchIntervalInBackground?: boolean;
}) => {
    return useQuery({
        queryFn: async () => {
            const response = await axios.get<GitHubRelease>(`${GITHUB_RELEASES_URL}/latest`);
            return response.data;
        },
        queryKey: ['github-latest-release'],
        retry: 2,
        ...options,
    });
};
