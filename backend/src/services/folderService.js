import { Folder } from '../models/Folder.js';
import { Note } from '../models/Note.js';

export class FolderService {
  static async listFolders(userId) {
    const folders = await Folder.find({ userId }).sort({ createdAt: 1 }).lean();
    
    // Count notes inside each folder
    const notesCounts = await Note.aggregate([
      { $match: { userId, isDeleted: false, folderId: { $ne: null } } },
      { $group: { _id: '$folderId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    notesCounts.forEach(c => {
      countMap[c._id.toString()] = c.count;
    });

    return folders.map(f => ({
      ...f,
      notesCount: countMap[f._id.toString()] || 0
    }));
  }

  static async createFolder(userId, { name, color = '#6366f1', icon = 'Folder', parentId = null }) {
    return await Folder.create({
      userId,
      name: name.trim(),
      color,
      icon,
      parentId: parentId || null
    });
  }

  static async updateFolder(folderId, userId, { name, color, icon }) {
    const folder = await Folder.findOneAndUpdate(
      { _id: folderId, userId },
      { ...(name ? { name: name.trim() } : {}), ...(color ? { color } : {}), ...(icon ? { icon } : {}) },
      { new: true }
    );
    if (!folder) throw new Error('Folder not found');
    return folder;
  }

  static async deleteFolder(folderId, userId) {
    const folder = await Folder.findOneAndDelete({ _id: folderId, userId });
    if (!folder) throw new Error('Folder not found');
    // Unassign notes in this folder
    await Note.updateMany({ folderId, userId }, { folderId: null });
    return { success: true, message: 'Folder deleted and notes moved to unsorted' };
  }
}
