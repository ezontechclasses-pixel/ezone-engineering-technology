const Material = require('../models/Material');

// @desc    Get materials for a unit (or all materials if no unit specified)
// @route   GET /api/materials?unitId=xxx
// @access  Public
const getMaterials = async (req, res, next) => {
  try {
    const filter = req.query.unitId ? { unitId: req.query.unitId } : {};
    const materials = await Material.find(filter).sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all materials with populated Unit & Course labels for admin UI
// @route   GET /api/materials/all-flat
// @access  Admin
const getAllMaterialsFlat = async (req, res, next) => {
  try {
    const rawMaterials = await Material.find()
      .populate({
        path: 'unitId',
        select: 'title courseId',
        populate: { path: 'courseId', select: 'title grade' },
      })
      .sort({ createdAt: -1 });

    const data = rawMaterials.map((m) => {
      const u = m.unitId;
      const c = u?.courseId;
      const unitLabel = c
        ? `Grade ${c.grade} › ${u.title}`
        : u
        ? u.title
        : 'Unassigned';

      return {
        _id:         m._id,
        title:       m.title,
        type:        m.type,
        unitId:      u?._id || m.unitId,
        unitLabel,
        fileUrl:     m.fileUrl,
        description: m.description,
        order:       m.order,
        createdAt:   m.createdAt,
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single material
// @route   GET /api/materials/:id
// @access  Public
const getMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }
    res.status(200).json({ success: true, data: material });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a material
// @route   POST /api/materials
// @access  Admin
const createMaterial = async (req, res, next) => {
  try {
    const material = await Material.create(req.body);
    res.status(201).json({ success: true, data: material });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a material
// @route   PUT /api/materials/:id
// @access  Admin
const updateMaterial = async (req, res, next) => {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }
    res.status(200).json({ success: true, data: material });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a material
// @route   DELETE /api/materials/:id
// @access  Admin
const deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }
    res.status(200).json({ success: true, message: 'Material deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMaterials,
  getAllMaterialsFlat,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};
