/* 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
*/

(function(AppInfo, deviceInfo) {
    'use strict';

    console.log('WebOS adapter');

    function postMessage(type, data) {
        window.top.postMessage({
            type: type,
            data: data
        }, '*');
    }

    // List of supported features
    var SupportedFeatures = [
        'exit',
        'externallinkdisplay',
        'htmlaudioautoplay',
        'htmlvideoautoplay',
        'imageanalysis',
        'physicalvolumecontrol',
        'displaylanguage',
        'otherapppromotions',
        'targetblank',
        'screensaver',
        'subtitleappearancesettings',
        'subtitleburnsettings',
        'chromecast',
        'multiserver'
    ];

    function applyTsHevcProfile(profile) {
        if (!profile) {
            return profile;
        }

        profile.MaxStreamingBitrate = Math.max(profile.MaxStreamingBitrate || 0, 140000000);
        profile.MaxStaticBitrate = Math.max(profile.MaxStaticBitrate || 0, 140000000);
        profile.EnableMpegtsM2TsMode = false;
        profile.MaxWidth = 3840;
        profile.MaxHeight = 2160;
        profile.MaxVideoBitDepth = 10;
        profile.MaxAudioBitDepth = 24;
        profile.MaxAudioChannels = 6;
        profile.MaxFramerate = 60;
        profile.RequireAvc = false;
        profile.RequireNonAnamorphic = false;
        profile.DeInterlace = false;
        profile.EnableAutoStreamCopy = true;
        profile.EnableVideoStreamCopy = true;
        profile.EnableAudioStreamCopy = true;
        profile.ResponseProfiles = [];

        var out = [];
        var hasTs = false;
        var profiles = profile.TranscodingProfiles || [];

        for (var i = 0; i < profiles.length; i++) {
            var p = profiles[i];

            if (p.Type !== 'Video') {
                out.push(p);
                continue;
            }

            if (hasTs) {
                continue;
            }

            p.Container = 'ts';
            p.SegmentContainer = '';
            p.Protocol = 'http';
            p.Context = 'Streaming';
            p.Type = 'Video';
            p.VideoCodec = 'hevc';
            p.AudioCodec = 'ac3,eac3,aac,mp3,mp2';
            p.MaxAudioChannels = '6';
            p.MaxAudioBitDepth = '24';
            p.AudioBitRate = '640000';
            delete p.SegmentLength;
            delete p.SegmentMaxWidth;
            delete p.MinSegments;
            delete p.MaxWidth;
            delete p.MaxHeight;

            out.push(p);
            hasTs = true;
        }

        if (!hasTs) {
            out.push({
                Container: 'ts',
                SegmentContainer: '',
                Protocol: 'http',
                Context: 'Streaming',
                Type: 'Video',
                VideoCodec: 'hevc',
                AudioCodec: 'ac3,eac3,aac,mp3,mp2',
                MaxAudioChannels: '6',
                MaxAudioBitDepth: '24',
                AudioBitRate: '640000',
                BreakOnNonKeyFrames: false
            });
        }

        profile.TranscodingProfiles = out;
        return profile;
    }

    window.NativeShell = {
        AppHost: {
            init: function () {
                postMessage('AppHost.init', AppInfo);
                return Promise.resolve(AppInfo);
            },

            appName: function () {
                postMessage('AppHost.appName', AppInfo.appName);
                return AppInfo.appName;
            },

            appVersion: function () {
                postMessage('AppHost.appVersion', AppInfo.appVersion);
                return AppInfo.appVersion;
            },

            deviceId: function () {
                postMessage('AppHost.deviceId', AppInfo.deviceId);
                return AppInfo.deviceId;
            },

            deviceName: function () {
                postMessage('AppHost.deviceName', AppInfo.deviceName);
                return AppInfo.deviceName;
            },

            exit: function () {
                postMessage('AppHost.exit');
            },

            getDefaultLayout: function () {
                postMessage('AppHost.getDefaultLayout', 'tv');
                return 'tv';
            },

            getDeviceProfile: function (profileBuilder) {
                postMessage('AppHost.getDeviceProfile');
                return applyTsHevcProfile(profileBuilder({
                    enableMkvProgressive: false,
                    enableSsaRender: true,
                    supportsDolbyAtmos: deviceInfo ? deviceInfo.dolbyAtmos : null,
                    supportsDolbyVision: deviceInfo ? deviceInfo.dolbyVision : null,
                    supportsHdr10: deviceInfo ? deviceInfo.hdr10 : null
                }));
            },

            getSyncProfile: function (profileBuilder) {
                postMessage('AppHost.getSyncProfile');
                return profileBuilder({ enableMkvProgressive: false });
            },

            supports: function (command) {
                var isSupported = command && SupportedFeatures.indexOf(command.toLowerCase()) != -1;
                postMessage('AppHost.supports', {
                    command: command,
                    isSupported: isSupported
                });
                return isSupported;
            },

            screen: function () {
                return deviceInfo ? {
                    width: deviceInfo.screenWidth,
                    height: deviceInfo.screenHeight
                } : null;
            }
        },

        selectServer: function () {
            postMessage('selectServer');
        },

        downloadFile: function (url) {
            postMessage('downloadFile', { url: url });
        },

        enableFullscreen: function () {
            postMessage('enableFullscreen');
        },

        disableFullscreen: function () {
            postMessage('disableFullscreen');
        },

        getPlugins: function () {
            postMessage('getPlugins');
            return [];
        },

        openUrl: function (url, target) {
            postMessage('openUrl', {
                url: url,
                target: target
            });
        },

        updateMediaSession: function (mediaInfo) {
            postMessage('updateMediaSession', { mediaInfo: mediaInfo });
        },

        hideMediaSession: function () {
            postMessage('hideMediaSession');
        }
    };
})(window.AppInfo, window.DeviceInfo);
