# Jellyfin webOS TS-HEVC

Unofficial community build of the Jellyfin webOS client for older LG webOS TVs.

This fork changes only one thing: the client reports an MPEG-TS HTTP device profile instead of an HLS profile for video transcoding. On compatible TVs this lets Jellyfin stream 4K HEVC with video/audio stream copy instead of re-encoding the whole video.

## What it fixes

Without this profile, some older webOS devices, especially LG C9/CX/BX generation devices, may receive HLS and full video re-encoding even when they can play 4K HEVC. With the TS profile, Jellyfin can use a path like:

```text
stream.ts
-codec:v:0 copy
-codec:a:0 copy
```

This avoids the common 4K HEVC stutter/black-video issue on devices that support HEVC directly but handle TS/HTTP progressive better than the default HLS profile.

## What it does not include

This build deliberately does not include:

- subtitle burn-in fixes,
- audio/subtitle switching restart workarounds,
- server URL or server ID preconfiguration,
- HDR tone-mapping tweaks.

Those behaviors depend heavily on the Jellyfin server, GPU headroom, subtitle format, and TV firmware.

## Tested

| Device | Server | Result |
| --- | --- | --- |
| LG OLED65C97LA, webOS 5 | Jellyfin 12.3.0, NVENC | 4K HEVC HDR/Dolby Vision remuxed as MPEG-TS, video copied, AC3 copied |
| same | same | DTS audio transcoded to AC3, video copied |

Other webOS devices are not guaranteed. Older webOS5 devices are the main target.

## Install

1. Enable the LG Developer Mode app on the TV.
2. Add the TV with `ares-setup-device`.
3. Build and install:

```bash
npm install
npm run package
npm run deploy
```

The packaged app ID is:

```text
org.weboscommunity.jellyfin.webos5
```

The app title is `Jellyfin TS-HEVC`.

## Package

After `npm run package`, the IPK is written to:

```text
build/org.weboscommunity.jellyfin.webos5_1.2.3_all.ipk
```

## License

This project is a derivative of https://github.com/jellyfin/jellyfin-webos and remains licensed under the Mozilla Public License 2.0.
</content>
