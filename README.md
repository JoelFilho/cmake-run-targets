# cmake-run-targets

This is a GitHub Action that:

1. Gets all executable targets from a CMake build
2. Runs each executable
  - Fails if any of them didn't return 0

## Inputs

| Input              | Required? | Default | Description                                                                                                                                             |
| ------------------ | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cmake-executable` | **yes**   | `cmake` | The path to the CMake executable                                                                                                                        |
| `build-folder`     | **yes**   | `build` | The path to the folder where the CMake project was built. **The build must already be completed**                                                       |
| `source-folders`   | **no**    |         | If specified, an executable target only runs if it **all** of its sources are contained in at least one of the folders.                                 |
| `fail-fast`        | **yes**   | `false` | If `true`, it finishes execution and fails as soon as the first executable returns a non-zero value. Otherwise, it runs all executables before failing. |

## Outputs

None.

## License

Copyright © 2020 Joel P. C. Filho

This software is released under the MIT License. Refer to the [License File](LICENSE.md) for more details.