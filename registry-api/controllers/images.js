import express from 'express';
import axios from 'axios';
import { checkAuth } from '../middlewares/auth.js';
import { addAudit } from './audit.js';

const router = express.Router();
const REGISTRY_API = process.env.REGISTRY_API || 'http://registry:5000/v2';

router.get('/', checkAuth, async (req, res) => {
  const filter = req.query.filter;

  try {
    const { data } = await axios.get(`${REGISTRY_API}/_catalog`, {
      headers: {
        Authorization: req.authHeader
      }
    });
    let repos = data.repositories;
    
    if (filter) {
      repos = repos.filter(repo => repo.includes(filter));
    }
    addAudit({ user: req.user, action: 'list_images', image: filter });
    res.json({ images: repos });
  } catch (err) {
    addAudit({ user: req.user, action: 'list_images', image: filter, error: err.message });
    res.status(500).json({ error: 'Failed to list images', details: err.message });
  }
});

router.get('/:image/tags', checkAuth, async (req, res) => {
  try {
    const { image } = req.params;
    const { data } = await axios.get(`${REGISTRY_API}/${image}/tags/list`, {
      headers: {
        Authorization: req.authHeader
      }
    });
    addAudit({ user: req.user, action: 'list_tags', image: image });
    res.json(data);
  } catch (err) {
    addAudit({ user: req.user, action: 'list_tags', image: image, error: err.message });
    res.status(500).json({ error: 'Failed to get tags', details: err.message });
  }
});

router.delete('/:image', checkAuth, async (req, res) => {
  try {
    const { image } = req.params;
    const { data, headers } = await axios.get(
      `${REGISTRY_API}/${image}/manifests/latest`,
      { 
        headers: { 
          Accept: 'application/vnd.docker.distribution.manifest.v2+json',
          Authorization: req.authHeader
        } 
      }
    );
    const digest = headers['docker-content-digest'];
    if (!digest) return res.status(404).json({ error: 'digest not found' });
    await axios.delete(`${REGISTRY_API}/${image}/manifests/${digest}`);
    addAudit({ user: req.user, action: 'delete_image', image: image });
    res.json({ success: true });
  } catch (err) {
    addAudit({ user: req.user, action: 'delete_image', image: image, error: err.message });
    res.status(500).json({ error: 'Failed to delete image', details: err.message });
  }
});

router.delete('/:image/tags/:tag', checkAuth, async (req, res) => {
  try {
    const { image, tag } = req.params;
    const { headers } = await axios.get(
      `${REGISTRY_API}/${image}/manifests/${tag}`,
      { 
        headers: { 
          Accept: 'application/vnd.docker.distribution.manifest.v2+json',
          Authorization: req.authHeader
        } 
      }
    );
    const digest = headers['docker-content-digest'];
    if (!digest) return res.status(404).json({ error: 'digest not found' });
    await axios.delete(`${REGISTRY_API}/${image}/manifests/${digest}`, {
      headers: {
        Authorization: req.authHeader
      }
    });
    addAudit({ user: req.user, action: 'delete_tag', image: image, tag: tag });
    res.json({ success: true });
  } catch (err) {
    addAudit({ user: req.user, action: 'delete_tag', image: image, tag: tag, error: err.message });
    res.status(500).json({ error: 'Failed to delete tag', details: err.message });
  }
});

export default router;
