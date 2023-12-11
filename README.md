# Discord Sigma

Discord sigma is a small bot designed to detect patterns in Discord users. The pattern matching and rule syntax are based on [Sigma rules](https://github.com/SigmaHQ/sigma), but adapted for the analysis of Discord users, rather than logfiles.

> [!WARNING]  
> This bot is still in devlopment and probably not ready for production use!

# Roadmap

- [x] Proper tests for string matching patterns as per [detection rules](https://sigmahq.io/sigma-specification/Sigma_specification.html#detection)
- [x] Date type with before|after|duringday modifiers
- [ ] Test objects against rule matching
- [ ] Test validity of used rules
- [ ] Look into [escape sequences](https://sigmahq.io/sigma-specification/Sigma_specification.html#detection)
- [ ] Throw errors in mismatches instead of just returning false
- [x] Number modifiers greater|lesser
- [ ] Rule evaluation CI
