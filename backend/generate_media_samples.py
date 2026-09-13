"""
Media Sample Generator for Saboot Netra.
Creates realistic CCTV videos, forensic evidence photos, and corrupted/damaged files
for testing forensic video playback, AI object detection, and deep file carving.
"""

import os
import shutil
import sys
from pathlib import Path

# Base paths
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
import numpy as np
from datetime import datetime, timedelta, timezone
import cv2
from PIL import Image, ImageDraw, ImageFont

# Base paths
ROOT_DIR = Path(__file__).resolve().parent.parent
STORAGE_SAMPLES = ROOT_DIR / "storage" / "evidence_samples"
VIDEOS_DIR = STORAGE_SAMPLES / "videos"
PICTURES_DIR = STORAGE_SAMPLES / "pictures"
CORRUPTED_DIR = STORAGE_SAMPLES / "corrupted_files"
DEMO_VIDEOS_DIR = ROOT_DIR / "demo" / "videos"

for d in [VIDEOS_DIR, PICTURES_DIR, CORRUPTED_DIR, DEMO_VIDEOS_DIR]:
    d.mkdir(parents=True, exist_ok=True)


def create_cctv_video(output_path: Path, camera_label: str, style: str = "cctv", duration_sec: int = 10, fps: int = 10):
    """Generates a valid playable MP4 CCTV video clip with burned-in OSD metadata and simulated motion."""
    width, height = 640, 360
    # Try mp4v or avc1
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))

    total_frames = duration_sec * fps
    base_time = datetime(2026, 9, 13, 23, 14, 0)

    for i in range(total_frames):
        current_time = base_time + timedelta(seconds=i / fps)
        time_str = current_time.strftime("%Y-%m-%d %H:%M:%S.%f")[:-4]
        progress = i / total_frames

        # Create canvas based on style
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        if style == "cctv":
            frame[:] = (26, 32, 40)  # Dark surveillance grey/blue
            # Draw perspective room / road lines
            cv2.line(frame, (0, int(height * 0.75)), (width, int(height * 0.75)), (50, 65, 80), 1)
            cv2.line(frame, (int(width * 0.2), height), (int(width * 0.45), int(height * 0.75)), (50, 65, 80), 1)
            cv2.line(frame, (int(width * 0.8), height), (int(width * 0.55), int(height * 0.75)), (50, 65, 80), 1)

            # Simulated moving subject (person)
            px = int(60 + progress * (width - 180))
            py = int(height * 0.52)
            # Body & head
            cv2.rectangle(frame, (px, py), (px + 32, py + 75), (0, 200, 100), 1)
            cv2.circle(frame, (px + 16, py + 14), 9, (180, 220, 240), -1)
            cv2.putText(frame, "PERSON #1", (px, py - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 220, 100), 1)

            # Moving vehicle in upper lane
            if progress > 0.2:
                vx = int(width - 100 - (progress - 0.2) * (width * 0.7))
                vy = int(height * 0.60)
                cv2.rectangle(frame, (vx, vy), (vx + 90, vy + 45), (220, 140, 50), 1)
                cv2.circle(frame, (vx + 6, vy + 28), 3, (120, 255, 255), -1)
                cv2.putText(frame, "VEHICLE", (vx, vy - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (220, 140, 50), 1)

        elif style == "night_vision":
            frame[:] = (10, 35, 15)  # Infrared night vision tint
            # Draw fence / perimeter
            for f_x in range(0, width, 40):
                cv2.line(frame, (f_x, int(height * 0.4)), (f_x, height), (20, 70, 30), 1)
            cv2.line(frame, (0, int(height * 0.6)), (width, int(height * 0.6)), (30, 90, 40), 1)

            # Thermal silhouette
            tx = int(width * 0.4 + np.sin(progress * np.pi) * 80)
            ty = int(height * 0.55)
            cv2.circle(frame, (tx, ty), 16, (140, 255, 160), -1)
            cv2.rectangle(frame, (tx - 12, ty + 12), (tx + 12, ty + 60), (120, 230, 140), -1)
            cv2.putText(frame, "HEAT SIG 36.8C", (tx - 35, ty - 22), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (140, 255, 160), 1)

        elif style == "traffic":
            frame[:] = (35, 35, 40)  # Asphalt road
            # Road markings
            cv2.line(frame, (0, int(height * 0.5)), (width, int(height * 0.5)), (80, 80, 85), 2)
            for m in range(0, width, 60):
                cv2.line(frame, (m, int(height * 0.5)), (m + 30, int(height * 0.5)), (220, 220, 220), 2)

            # Cars moving both ways
            c1_x = int((progress * width * 1.3) % (width + 100) - 50)
            cv2.rectangle(frame, (c1_x, int(height * 0.35)), (c1_x + 70, int(height * 0.35) + 35), (200, 100, 60), -1)
            c2_x = int(width - ((progress * width * 1.5) % (width + 100)) + 50)
            cv2.rectangle(frame, (c2_x, int(height * 0.6)), (c2_x + 80, int(height * 0.6) + 40), (80, 160, 220), -1)

        # Common CCTV OSD Metadata Overlay
        # Red REC indicator
        cv2.circle(frame, (25, 25), 6, (0, 0, 255), -1)
        cv2.putText(frame, f"REC  {camera_label}", (38, 29), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (0, 255, 150), 1, cv2.LINE_AA)
        cv2.putText(frame, time_str, (width - 225, 29), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (240, 240, 240), 1, cv2.LINE_AA)
        cv2.putText(frame, f"ISO/IEC 27037 FORENSIC STREAM | {fps} FPS", (20, height - 15), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (140, 140, 140), 1)
        cv2.putText(frame, f"{width}x{height} H.264", (width - 115, height - 15), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (140, 140, 140), 1)

        out.write(frame)

    out.release()
    print(f"[OK] Generated video: {output_path}")


def create_forensic_picture(output_path: Path, title: str, subtitle: str, badge_type: str = "SECURE"):
    """Generates a high quality forensic evidence picture with metadata and annotations."""
    width, height = 1280, 720
    img = Image.new("RGB", (width, height), color=(18, 22, 28))
    draw = ImageDraw.Draw(img)

    # Grid lines / Reticle pattern
    for x in range(0, width, 80):
        draw.line([(x, 0), (x, height)], fill=(28, 36, 45), width=1)
    for y in range(0, height, 80):
        draw.line([(0, y), (width, y)], fill=(28, 36, 45), width=1)

    # Crosshair reticle in center
    cx, cy = width // 2, height // 2
    draw.line([(cx - 40, cy), (cx + 40, cy)], fill=(0, 220, 130), width=1)
    draw.line([(cx, cy - 40), (cx, cy + 40)], fill=(0, 220, 130), width=1)
    draw.ellipse([(cx - 20, cy - 20), (cx + 20, cy + 20)], outline=(0, 220, 130), width=1)

    # Top banner
    draw.rectangle([(0, 0), (width, 50)], fill=(12, 16, 22))
    draw.text((25, 16), f"SABOOT NETRA DIGITAL FORENSIC EVIDENCE - {badge_type}", fill=(0, 255, 160))
    timestamp_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    draw.text((width - 260, 16), timestamp_str, fill=(200, 200, 200))

    # Simulated Evidence ROI / Bounding Box
    box_x1, box_y1 = int(width * 0.32), int(height * 0.28)
    box_x2, box_y2 = int(width * 0.68), int(height * 0.72)
    draw.rectangle([(box_x1, box_y1), (box_x2, box_y2)], outline=(0, 180, 255), width=2)
    # Corner marks
    c_len = 20
    for px, py in [(box_x1, box_y1), (box_x2, box_y1), (box_x1, box_y2), (box_x2, box_y2)]:
        draw.line([(px - c_len, py), (px + c_len, py)], fill=(0, 255, 255), width=3)
        draw.line([(px, py - c_len), (px, py + c_len)], fill=(0, 255, 255), width=3)

    # Target subject placeholder
    draw.rectangle([(box_x1 + 30, box_y1 + 40), (box_x2 - 30, box_y2 - 30)], fill=(32, 42, 54))
    draw.text((box_x1 + 45, box_y1 + 60), f"SUBJECT: {title}", fill=(255, 255, 255))
    draw.text((box_x1 + 45, box_y1 + 90), f"NOTES: {subtitle}", fill=(180, 190, 205))
    draw.text((box_x1 + 45, box_y1 + 120), "AI CONFIDENCE: 96.4% | CLASSIFICATION: VERIFIED", fill=(0, 220, 130))

    # Bottom status bar
    draw.rectangle([(0, height - 40), (width, height)], fill=(12, 16, 22))
    draw.text((25, height - 28), "CHAIN OF CUSTODY: IMMUTABLE | HASH INTEGRITY: SHA-256 CHECKED", fill=(140, 150, 165))
    draw.text((width - 240, height - 28), "EVIDENCE CODE: SEC-EVD-9842", fill=(0, 200, 255))

    img.save(str(output_path), quality=95)
    print(f"[OK] Generated picture: {output_path}")


def create_corrupted_files():
    """
    Creates various realistically corrupted forensic files:
    1. corrupted_cctv_missing_moov.mp4: Valid H.264 mdat/NALU payload, but deliberately missing the 'moov' atom.
    2. damaged_dvr_stream.dav: Proprietary Dahua DHAV stream with corrupt headers and broken GOP packet boundaries.
    3. corrupted_evidence_snapshot.jpg: JPEG header followed by broken entropy scan and missing EOI marker.
    4. unallocated_carve_disk_dump.raw: Raw binary disk sectors with embedded NALU / JPEG signatures amongst zeroes.
    """
    # 1. Corrupted MP4 with missing 'moov' atom
    # Standard ISO-BMFF starts with ftyp atom, then mdat with video payload. Without moov, media players fail.
    mp4_corrupt_path = CORRUPTED_DIR / "corrupted_cctv_missing_moov.mp4"
    ftyp_atom = b"\x00\x00\x00\x18ftypisom\x00\x00\x02\x00isomiso2avc1mp41"
    # mdat atom with realistic H.264 NALUs: SPS (0x67), PPS (0x68), IDR (0x65)
    nalu_sps = b"\x00\x00\x00\x01\x67\x42\xc0\x1e\xd9\x01\x41\xfb\x01\x10\x00\x00\x03\x00\x10\x00\x00\x03\x03\x20"
    nalu_pps = b"\x00\x00\x00\x01\x68\xce\x3c\x80"
    nalu_idr = b"\x00\x00\x00\x01\x65\x88\x80\x40\x00\x3f\xff" + os.urandom(2048)
    mdat_payload = nalu_sps + nalu_pps + nalu_idr
    mdat_atom = len(mdat_payload + b"12345678").to_bytes(4, byteorder="big") + b"mdat" + mdat_payload
    # Note: moov atom is completely omitted, simulating power cut during DVR recording
    with open(mp4_corrupt_path, "wb") as f:
        f.write(ftyp_atom + mdat_atom)
    print(f"[OK] Generated corrupted file: {mp4_corrupt_path}")

    # 2. Damaged proprietary Dahua DVR stream (.dav)
    dav_corrupt_path = CORRUPTED_DIR / "damaged_dvr_stream.dav"
    dhav_header = b"DHAV\xfd\x00\x00\x00\x01\x00\x00\x00"
    corrupt_gap = b"\xff\xff\xff\xff" * 64 + os.urandom(512)
    dhav_packet = dhav_header + b"\x00\x00\x00\x01\x65\x20\x30\x40" + os.urandom(1024)
    with open(dav_corrupt_path, "wb") as f:
        f.write(dhav_packet + corrupt_gap + dhav_packet)
    print(f"[OK] Generated corrupted file: {dav_corrupt_path}")

    # 3. Corrupted Evidence Image (.jpg)
    jpg_corrupt_path = CORRUPTED_DIR / "corrupted_evidence_snapshot.jpg"
    # SOI (0xFF 0xD8) + JFIF marker + corrupt truncated entropy stream
    jpg_soi = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00"
    damaged_stream = os.urandom(1024) + b"\x00\x00\x00\x00" * 32  # Broken scan data without EOI (0xFF 0xD9)
    with open(jpg_corrupt_path, "wb") as f:
        f.write(jpg_soi + damaged_stream)
    print(f"[OK] Generated corrupted file: {jpg_corrupt_path}")

    # 4. Raw Unallocated Disk Sector Dump (.raw) for Forensic Carver
    raw_carve_path = CORRUPTED_DIR / "unallocated_carve_disk_dump.raw"
    # 64KB sector dump with unallocated zeroes, fragmented H.264 NALUs, DHAV headers, and JPEG SOI
    dump_data = bytearray(64 * 1024)
    # Inject H.264 SPS at cluster offset 0x1000
    dump_data[0x1000:0x1018] = b"\x00\x00\x00\x01\x67\x42\xc0\x1e\xd9\x01\x41\xfb\x01\x10\x00\x00\x03\x00\x10\x00\x00\x03\x03\x20"
    # Inject H.264 IDR at cluster offset 0x2400
    dump_data[0x2400:0x240B] = b"\x00\x00\x00\x01\x65\x88\x80\x40\x00\x3f\xff"
    # Inject DHAV packet header at cluster offset 0x4800
    dump_data[0x4800:0x4808] = b"DHAV\xfd\x00\x00\x00"
    # Inject JPEG Keyframe SOI at cluster offset 0x8200
    dump_data[0x8200:0x8203] = b"\xff\xd8\xff"
    # Inject PNG header at cluster offset 0xA000
    dump_data[0xA000:0xA008] = b"\x89PNG\r\n\x1a\n"

    with open(raw_carve_path, "wb") as f:
        f.write(dump_data)
    print(f"[OK] Generated corrupted file: {raw_carve_path}")


def sync_to_demo():
    """Syncs created playable videos to demo/videos directory."""
    for v in VIDEOS_DIR.glob("*.mp4"):
        dest = DEMO_VIDEOS_DIR / v.name
        shutil.copyfile(v, dest)
        print(f"[OK] Synced video to demo/videos: {dest.name}")


def register_in_data_store():
    """Registers created files into backend/data.db for relational querying."""
    try:
        from backend.data_store import store_data
        
        # Register Videos
        for v in VIDEOS_DIR.glob("*"):
            store_data(
                key=f"video_{v.stem}",
                value={
                    "filename": v.name,
                    "filepath": str(v),
                    "size_bytes": v.stat().st_size,
                    "type": "video",
                    "format": v.suffix[1:],
                    "status": "Ready / Playable"
                },
                category="media_videos"
            )
        
        # Register Pictures
        for p in PICTURES_DIR.glob("*"):
            store_data(
                key=f"picture_{p.stem}",
                value={
                    "filename": p.name,
                    "filepath": str(p),
                    "size_bytes": p.stat().st_size,
                    "type": "picture",
                    "format": p.suffix[1:],
                    "status": "Ready / High-Res"
                },
                category="media_pictures"
            )

        # Register Corrupted Files
        for c in CORRUPTED_DIR.glob("*"):
            store_data(
                key=f"corrupt_{c.stem}",
                value={
                    "filename": c.name,
                    "filepath": str(c),
                    "size_bytes": c.stat().st_size,
                    "type": "corrupted_file",
                    "format": c.suffix[1:],
                    "status": "Damaged / Carver Ready"
                },
                category="media_corrupted"
            )

        print("[OK] Successfully registered all media and corrupted files into backend/data.db!")
    except Exception as e:
        print(f"[WARN] Could not register in data_store: {e}")


def main():
    print("=== Saboot Netra Media & Corrupted File Generator ===")
    
    # 1. Generate playable CCTV videos
    create_cctv_video(VIDEOS_DIR / "surveillance_cam01_entrance.mp4", "CAM-01 Entrance Gate", style="cctv", duration_sec=12)
    create_cctv_video(VIDEOS_DIR / "surveillance_cam02_night_patrol.mp4", "CAM-02 Night Perimeter", style="night_vision", duration_sec=10)
    create_cctv_video(VIDEOS_DIR / "traffic_intersection_feed.mp4", "CAM-03 Traffic Sector 4", style="traffic", duration_sec=10)

    # 2. Generate forensic pictures / snapshots
    create_forensic_picture(
        PICTURES_DIR / "cctv_snapshot_gate_suspect.jpg",
        title="SUSPECT ENTRANCE BREACH",
        subtitle="Gate 1 perimeter entry logged at 23:14:22",
        badge_type="TAMPER-CHECKED"
    )
    create_forensic_picture(
        PICTURES_DIR / "suspect_vehicle_plate_crop.png",
        title="COMMERCIAL VEHICLE INFILTRATION",
        subtitle="Delivery Van detected in loading bay without manifest",
        badge_type="AI CLASSIFIED"
    )
    create_forensic_picture(
        PICTURES_DIR / "tampered_timestamp_freeze.jpg",
        title="CHRONO-DRIFT ANALYSIS",
        subtitle="Clock offset discrepancy detected between CH-01 & CH-04",
        badge_type="ANOMALY FLAGGED"
    )

    # 3. Generate corrupted and damaged files for carving/recovery
    create_corrupted_files()

    # 4. Sync to demo directory
    sync_to_demo()

    # 5. Store records in SQLite data.db
    register_in_data_store()

    print("=== All Videos, Pictures, and Corrupted Files Successfully Generated! ===")


if __name__ == "__main__":
    main()
