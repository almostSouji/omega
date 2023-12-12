# Discord Sigma

Discord sigma is a small bot designed to detect patterns in Discord users. The pattern matching and rule syntax are based on [Sigma rules](https://github.com/SigmaHQ/sigma), but adapted for the analysis of Discord users, rather than logfiles.

> [!WARNING]  
> This bot is still in devlopment and probably not ready for production use!

# Roadmap

- [x] Proper tests for string matching patterns as per [detection rules](https://sigmahq.io/sigma-specification/Sigma_specification.html#detection)
- [x] Date type with before|after|duringday modifiers
- [x] Test objects against rule matching
- [x] Dot attribute access (might need a secondary parser for this
- [x] Look into [escape sequences](https://sigmahq.io/sigma-specification/Sigma_specification.html#detection)
- [x] Number modifiers greater|lesser
- [ ] Enable handling snowflakes as string or datestring
- [ ] Test validity of used rules
- [ ] Rule evaluation CI
