import os
import subprocess

def reencode_to_h264(input_filepath, output_filepath):
    """Reencode video to h.264 format."""
    cmd = [
        'ffmpeg', 
        '-i', input_filepath, 
        '-c:v', 'libx264', 
        '-x264opts', 'opencl', 
        '-preset', 'slow', 
        '-crf', '15', 
        '-c:a', 'copy', 
        output_filepath
    ]
    subprocess.run(cmd, check=True)

def convert_to_hls(input_filepath, output_playlist):
    """Convert h.264 encoded video to HLS format."""
    cmd = [
        'ffmpeg', 
        '-i', input_filepath, 
        '-codec', 'copy', 
        '-start_number', '0', 
        '-hls_time', '2', 
        '-hls_list_size', '0', 
        '-hls_segment_filename', 'chunk%03d.ts', 
        '-hls_flags', 'delete_segments', 
        '-force_key_frames', 'expr:gte(t,n_forced*2)', 
        '-g', '60', 
        '-f', 'hls', 
        output_playlist
    ]
    subprocess.run(cmd, check=True)

def process_videos(root_dir):
    """Process all MP4 videos in specified directory and subdirectories."""
    for subdir, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.mp4'):
                input_filepath = os.path.join(subdir, file)
                base_filename = file[:-4]  # Remove .mp4 extension
                output_h264 = os.path.join(subdir, f"{base_filename}_h264.mp4")
                output_hls = os.path.join(subdir, f"{base_filename}_hls.m3u8")

                # Perform reencoding to h.264
                reencode_to_h264(input_filepath, output_h264)

                # Convert to HLS
                convert_to_hls(output_h264, output_hls)

                # Optionally, you can remove the h264 file after HLS conversion
                # os.remove(output_h264)

if __name__ == "__main__":
    process_videos("atmosphere")
