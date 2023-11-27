# Discord Sigma

Discord sigma is a small bot designed to detect patterns in Discord users. The pattern matching and rule syntax are based on [Sigma rules](https://github.com/SigmaHQ/sigma), but adapted for the analysis of Discord users, rather than logfiles.

> [!WARNING]  
> This bot is still in devlopment and probably not ready for production use!

# Roadmap

- [ ] Proper tests for string matching patterns as per [detection rules](https://sigmahq.io/sigma-specification/Sigma_specification.html#detection)
- [ ] Test objects against rule matching
- [ ] Look into [escape sequences](https://sigmahq.io/sigma-specification/Sigma_specification.html#detection)
- [ ] Throw errors in mismatches instead of just returning false
- [ ] Consider using second parser for key modifiers instead of splitting
- [ ] Date type with before|after|duringday modifiers
- [ ] Rule evaluation CI
