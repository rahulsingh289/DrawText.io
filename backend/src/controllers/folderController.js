import { FolderService } from '../services/folderService.js';

export const listFolders = async (req, res, next) => {
  try {
    const folders = await FolderService.listFolders(req.user._id);
    res.json({ success: true, count: folders.length, data: folders });
  } catch (err) {
    next(err);
  }
};

export const createFolder = async (req, res, next) => {
  try {
    const { name, color, icon, parentId } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Folder name is required' });
    }
    const folder = await FolderService.createFolder(req.user._id, { name, color, icon, parentId });
    res.status(201).json({ success: true, data: folder });
  } catch (err) {
    next(err);
  }
};

export const updateFolder = async (req, res, next) => {
  try {
    const folder = await FolderService.updateFolder(req.params.id, req.user._id, req.body);
    res.json({ success: true, data: folder });
  } catch (err) {
    next(err);
  }
};

export const deleteFolder = async (req, res, next) => {
  try {
    const result = await FolderService.deleteFolder(req.params.id, req.user._id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
