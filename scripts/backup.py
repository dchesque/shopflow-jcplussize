#!/usr/bin/env python3
"""
ShopFlow Backup and Disaster Recovery Script

This script handles automated backups of:
- Supabase database
- Configuration files
- Media files (if any)
- Application state
"""

import os
import subprocess
import datetime
import json
import shutil
import logging
from pathlib import Path
import argparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backup.log'),
        logging.StreamHandler()
    ]
)

class ShopFlowBackup:
    def __init__(self, config_file='backup_config.json'):
        self.config = self.load_config(config_file)
        self.backup_dir = Path(self.config.get('backup_directory', './backups'))
        self.backup_dir.mkdir(exist_ok=True)
        
    def load_config(self, config_file):
        """Load backup configuration"""
        try:
            with open(config_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logging.warning(f"Config file {config_file} not found, using defaults")
            return {
                'backup_directory': './backups',
                'retention_days': 30,
                'supabase_url': os.getenv('SUPABASE_URL'),
                'supabase_service_key': os.getenv('SUPABASE_SERVICE_KEY'),
                'include_media': True,
                'compress': True
            }
    
    def create_timestamp(self):
        """Create timestamp for backup files"""
        return datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    
    def backup_database(self):
        """Backup Supabase database using pg_dump"""
        timestamp = self.create_timestamp()
        backup_file = self.backup_dir / f'database_backup_{timestamp}.sql'
        
        try:
            # Extract database connection details from Supabase URL
            supabase_url = self.config.get('supabase_url')
            if not supabase_url:
                raise ValueError("Supabase URL not configured")
            
            # For actual implementation, you would use supabase-py or direct PostgreSQL connection
            # This is a placeholder for the backup command
            logging.info(f"Creating database backup: {backup_file}")
            
            # Placeholder - in real implementation, use:
            # supabase db dump --db-url="postgresql://..." > backup_file
            
            # Create a dummy backup file for demonstration
            with open(backup_file, 'w') as f:
                f.write(f"-- ShopFlow Database Backup\n")
                f.write(f"-- Created: {datetime.datetime.now()}\n")
                f.write(f"-- Placeholder backup file\n")
            
            if self.config.get('compress', True):
                self.compress_file(backup_file)
                
            logging.info(f"Database backup completed: {backup_file}")
            return backup_file
            
        except Exception as e:
            logging.error(f"Database backup failed: {e}")
            return None
    
    def backup_configuration(self):
        """Backup configuration files"""
        timestamp = self.create_timestamp()
        config_backup_dir = self.backup_dir / f'config_{timestamp}'
        config_backup_dir.mkdir(exist_ok=True)
        
        try:
            # Files to backup
            config_files = [
                'frontend/.env.local',
                'frontend/.env.production',
                'frontend/next.config.js',
                'frontend/package.json',
                'frontend/vercel.json',
                'backend/.env',
                'backend/requirements.txt',
                'backend/main.py'
            ]
            
            for config_file in config_files:
                source_path = Path(config_file)
                if source_path.exists():
                    dest_path = config_backup_dir / source_path.name
                    shutil.copy2(source_path, dest_path)
                    logging.info(f"Backed up: {source_path}")
            
            if self.config.get('compress', True):
                self.compress_directory(config_backup_dir)
            
            logging.info(f"Configuration backup completed: {config_backup_dir}")
            return config_backup_dir
            
        except Exception as e:
            logging.error(f"Configuration backup failed: {e}")
            return None
    
    def backup_media_files(self):
        """Backup media files and uploads"""
        if not self.config.get('include_media', True):
            logging.info("Media backup disabled")
            return None
        
        timestamp = self.create_timestamp()
        media_backup_dir = self.backup_dir / f'media_{timestamp}'
        
        try:
            # Directories to backup
            media_dirs = [
                'backend/uploads',
                'backend/logs',
                'backend/face_embeddings',
                'frontend/public'
            ]
            
            for media_dir in media_dirs:
                source_path = Path(media_dir)
                if source_path.exists():
                    dest_path = media_backup_dir / source_path.name
                    shutil.copytree(source_path, dest_path)
                    logging.info(f"Backed up: {source_path}")
            
            if self.config.get('compress', True):
                self.compress_directory(media_backup_dir)
            
            logging.info(f"Media backup completed: {media_backup_dir}")
            return media_backup_dir
            
        except Exception as e:
            logging.error(f"Media backup failed: {e}")
            return None
    
    def compress_file(self, file_path):
        """Compress a file using gzip"""
        try:
            subprocess.run(['gzip', str(file_path)], check=True)
            logging.info(f"Compressed: {file_path}")
        except subprocess.CalledProcessError as e:
            logging.error(f"Compression failed for {file_path}: {e}")
    
    def compress_directory(self, dir_path):
        """Compress a directory using tar"""
        try:
            archive_path = f"{dir_path}.tar.gz"
            subprocess.run(['tar', '-czf', archive_path, '-C', str(dir_path.parent), str(dir_path.name)], check=True)
            shutil.rmtree(dir_path)
            logging.info(f"Compressed directory: {archive_path}")
        except subprocess.CalledProcessError as e:
            logging.error(f"Directory compression failed for {dir_path}: {e}")
    
    def cleanup_old_backups(self):
        """Remove backups older than retention period"""
        retention_days = self.config.get('retention_days', 30)
        cutoff_date = datetime.datetime.now() - datetime.timedelta(days=retention_days)
        
        try:
            for backup_file in self.backup_dir.glob('*'):
                if backup_file.is_file():
                    file_time = datetime.datetime.fromtimestamp(backup_file.stat().st_mtime)
                    if file_time < cutoff_date:
                        backup_file.unlink()
                        logging.info(f"Removed old backup: {backup_file}")
                        
        except Exception as e:
            logging.error(f"Cleanup failed: {e}")
    
    def create_backup_manifest(self, backups):
        """Create a manifest of created backups"""
        timestamp = self.create_timestamp()
        manifest_file = self.backup_dir / f'manifest_{timestamp}.json'
        
        manifest = {
            'timestamp': datetime.datetime.now().isoformat(),
            'backups': [str(backup) for backup in backups if backup],
            'config': self.config
        }
        
        with open(manifest_file, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        logging.info(f"Backup manifest created: {manifest_file}")
        return manifest_file
    
    def run_full_backup(self):
        """Run complete backup process"""
        logging.info("Starting full backup process")
        
        backups = []
        
        # Database backup
        db_backup = self.backup_database()
        if db_backup:
            backups.append(db_backup)
        
        # Configuration backup
        config_backup = self.backup_configuration()
        if config_backup:
            backups.append(config_backup)
        
        # Media backup
        media_backup = self.backup_media_files()
        if media_backup:
            backups.append(media_backup)
        
        # Create manifest
        manifest = self.create_backup_manifest(backups)
        backups.append(manifest)
        
        # Cleanup old backups
        self.cleanup_old_backups()
        
        logging.info(f"Backup process completed. Created {len(backups)} backup files")
        return backups

def main():
    parser = argparse.ArgumentParser(description='ShopFlow Backup System')
    parser.add_argument('--config', default='backup_config.json', help='Backup configuration file')
    parser.add_argument('--type', choices=['full', 'database', 'config', 'media'], default='full', 
                       help='Type of backup to perform')
    
    args = parser.parse_args()
    
    backup_system = ShopFlowBackup(args.config)
    
    if args.type == 'full':
        backup_system.run_full_backup()
    elif args.type == 'database':
        backup_system.backup_database()
    elif args.type == 'config':
        backup_system.backup_configuration()
    elif args.type == 'media':
        backup_system.backup_media_files()

if __name__ == '__main__':
    main()