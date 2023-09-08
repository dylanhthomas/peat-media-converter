# PEAT Media Converter

**With this tool, you will be able to take any video or animated gif and prep it for analysis in PEAT, without any technical knowledge.**

This tool was developed with the sole purpose of making it simple and foolproof to prepare videos and animated gifs for analysis by PEAT (Photosensitive Epilepsy Analysis Tool), without use of multiple apps, the command-line, or messing with settings.

_PEAT is great, but it is picky when it comes to what files it will analyze._

It will only work with videos that are:

- uncompressed AVI format

- 2 GB or less



## Who is this tool for?

If you work in accessibility testing, or want to check the safety of motion media you are producing, this tool can help you use PEAT to do that.

This is especially for those who are unable to use, or are uncomfortable using, command line tools like `ffmpeg`.

If you are curious of the technical underpinings and the commmands that are used behind the scenes, see [Technical Details](#technical-details).


## How to Use

1. [Download the installer](https://github.com/dylanhthomas/peat-media-converter/releases) and install it

1. Launch the application

1. Select the type of conversion you want to make
<img alt="" src="https://user-images.githubusercontent.com/824168/226491167-69e090bf-e8bb-4185-bb15-6865f04e9f82.png" width="300">

1. Select the file you want to convert
<img alt="" src="https://user-images.githubusercontent.com/824168/226491191-9cccc74c-123d-4157-bb9d-e01d7a3f4b4c.png" width="300">

1. Once the conversion is completed, the converted file will be shown in Windows Explorer
<img alt="" src="https://user-images.githubusercontent.com/824168/226491200-3f1d42ac-c61d-4880-93d1-07566d2effa9.png" width="300">


## Usage Notes

- Original files are never touched
- Converted files will be placed in a `converter_output` subfolder in the same folder where the original is located
- The app will auto-update if new versions are released

<br><br><br><br>

## About PEAT, from https://trace.umd.edu/peat/

<blockquote>
The Trace Center’s Photosensitive Epilepsy Analysis Tool (PEAT) is a free, downloadable resource for developers to identify seizure risks in their web content and software. The evaluation used by PEAT is based on an analysis engine developed specifically for web and computer applications.

PEAT can help authors determine whether animations or video in their content are likely to cause seizures. Not all content needs to be evaluated by PEAT, but content that contains video or animation should be evaluated, especially if that content contains flashing or rapid transitions between light and dark background colors.
</blockquote>

<br><br><br><br>

## Technical Details

**This is not needed to use the tool, this info is for the curious**

### App Details

This app is just a GUI front-end that passes files and commands to an included version of `ffmpeg`. The gui is built using [electron](https://www.electronjs.org/).

`ffmpeg` is a powerful tool for processing media. A lot of googling and trial and error led to the following commands for the presets in the app. Here they are along with their explanations.


### Conversion Mode Details

The app includes three conversion modes, each for a slightly different use case.

#### Video - Basic Processing

Best for short or small videos. Convert a video into a single uncompressed AVI. Audio will be discarded.

`ffmpeg -i [INPUT FILE] -an -vcodec rawvideo -y -r 25 -hide_banner -loglevel error [OUTPUT]_converted.avi`

```
Explanation:
        -i                  input file
        -an                 discard audio
        -vcodec rawvideo    rencode video as raw, uncompressed
        -y                  overwrite any files with same name in output directory
        -r 25               set framerate as 25 frames per second
        -hidebanner         hide ffmpeg info in console
        -loglever error     only output errors to console
```

#### Animated GIF

Convert an animated gif into an uncompressed AVI that can be analyzed by PEAT.

`ffmpeg -i [INPUT FILE] -an -vcodec rawvideo -y -r 25 -hide_banner -loglevel error -pix_fmt yuv420p [OUTPUT]_converted.avi`

```
Explanation:
        Same as above, plus:
        -pix_fmt yuv420p    encode using video pixels
```

#### Video - Full Processing

Best for long or large videos. Convert a video into uncompressed AVI and scale it down to 640 pixels wide. Audio will be discarded. If the resulting file is larger than 1 GB, the video will be split into equal parts of no larger than 1 GB.

`ffmpeg -i [INPUT FILE] -an -vcodec rawvideo -y -r 25 -hide_banner -loglevel error -vf "scale='min(640,iw)':-1" && $ffss "[OUTPUT]_converted.avi" 1000000000 "converter_output"`


```
Explanation:

ffmpeg
                -vf "scale='min(640,iw)':-1"    scale video down to 640 pixels wide if it is larger, maintain aspect ratio.

ffss
                "[OUTPUT]_converted.avi"        input file
                1000000000                      size limit (1,000,000,000 bytes)
                "converter_output"              output directory

```




## Acknowledgements & Credits

I would like to thank Zoltan "Du Lac" Hawryluk (User Agent Man) whose explanations of PEAT and ffmpeg comprised the "middle mile" of my investigation and experimentations that led to this app processing video that would always work in PEAT. Especially helpful were his two posts:

- [Using PEAT To Create Seizureless Web Animations](https://www.useragentman.com/blog/2017/04/02/using-peat-to-create-seizureless-web-animations/)
- [How to Fix Seizure Inducing Sequences In Videos](https://www.useragentman.com/blog/2020/07/19/how-to-fix-seizure-inducing-sequences-in-videos/)

I would like thank Coding Shiksha for his video, [Build a Media Converter Desktop App Using Electron.js & FFMPEG Full Project For Beginners]( https://www.youtube.com/watch?v=3oqYfVcELJY&t=1s). This app is basically an extended, specialized, and packaged version of the app built in this video.

I would like to thank Lin Yu-Chieh, whose [ffmpegFileSizeSplit](https://github.com/lin-ycv/ffmpegFileSizeSplit) provided a ready solution to splitting videos by size, rather than duration, that I modified to work with AVIs.
