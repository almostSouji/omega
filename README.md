# A SIEM detection format for JavaScript objects.

The pattern matching and rule syntax are based on [Sigma rules](https://github.com/SigmaHQ/sigma), but adapted for the analysis of javscript objects rather than logfiles.

- [Writing detection logic](https://github.com/almostSouji/omega/wiki/How-to-write-a-rule) is simple, yet quite powerful!
- [Rules can have rich meta data](https://github.com/almostSouji/omega/wiki/Rule-Fields), so you know what is matched and why!
- [Integreation is approachable](https://github.com/almostSouji/omega/wiki), you should be able to get this working pretty quickly!

## Contributing

Before contributing, please read through the [wiki](https://github.com/almostSouji/omega/wiki). It details almost anything there is to know. If the wiki is not specific enough, check out the [Sigma rule specification](https://github.com/SigmaHQ/sigma-specification), Omega is built around it!

Before submitting a PR, please make sure:

- The project builds `yarn build`.
- The tests run without fail `yarn test`.
- The format and lint rule are applied and respected `yarn lint`, `yarn format`.

## Inspiration and simialar projects

This project closely follows the sigma rule specification and was inspired by seeing these amazing projects in action:

- https://github.com/SigmaHQ/sigma (log files)
- https://github.com/VirusTotal/yara (malware)
- https://www.snort.org/ (network traffic)
- https://github.com/phish-report/IOK (phishing kits)
