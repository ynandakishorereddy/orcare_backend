const { supabase } = require('../config/supabase');

// @desc Get all diseases
const getDiseases = async (req, res) => {
    try {
        const { data: diseases, error } = await supabase
            .from('diseases')
            .select('*');

        if (error) throw error;

        return res.status(200).json({
            success: true,
            diseases: diseases.map(disease => ({
                id: disease.id,
                name: disease.name,
                iconName: disease.icon_name,
                colorHex: disease.color_hex,
                whatIsHappening: disease.what_is_happening,
                whatPeopleNotice: disease.what_people_notice,
                whyItHappens: disease.why_it_happens,
                whyNotIgnore: disease.why_not_ignore,
                whenToSeeDentist: disease.when_to_see_dentist,
            }))
        });
    } catch (error) {
        console.error('Get diseases error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to fetch diseases" });
    }
};

// @desc Get disease by ID
const getDiseaseById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Disease ID is required" });
    }

    try {
        const { data: disease, error } = await supabase
            .from('diseases')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!disease) {
            return res.status(404).json({ message: "Disease not found" });
        }

        return res.status(200).json({
            success: true,
            disease: {
                id: disease.id,
                name: disease.name,
                iconName: disease.icon_name,
                colorHex: disease.color_hex,
                whatIsHappening: disease.what_is_happening,
                whatPeopleNotice: disease.what_people_notice,
                whyItHappens: disease.why_it_happens,
                whyNotIgnore: disease.why_not_ignore,
                whenToSeeDentist: disease.when_to_see_dentist,
            }
        });
    } catch (error) {
        console.error('Get disease by ID error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to fetch disease" });
    }
};

// @desc Get all learning categories
const getLearningCategories = async (req, res) => {
    try {
        const { data: categories, error } = await supabase
            .from('learning_categories')
            .select('*');

        if (error) throw error;

        return res.status(200).json({
            success: true,
            categories: categories.map(category => ({
                id: category.id,
                title: category.title,
                iconName: category.icon_name,
                colorHex: category.color_hex,
                modules: category.modules_json || []
            }))
        });
    } catch (error) {
        console.error('Get learning categories error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to fetch learning categories" });
    }
};

// @desc Get learning category by ID
const getLearningCategoryById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Category ID is required" });
    }

    try {
        const { data: category, error } = await supabase
            .from('learning_categories')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        return res.status(200).json({
            success: true,
            category: {
                id: category.id,
                title: category.title,
                iconName: category.icon_name,
                colorHex: category.color_hex,
                modules: category.modules_json || []
            }
        });
    } catch (error) {
        console.error('Get learning category by ID error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to fetch learning category" });
    }
};

// @desc Get module by ID
const getModuleById = async (req, res) => {
    const { categoryId, moduleId } = req.params;

    if (!categoryId || !moduleId) {
        return res.status(400).json({ message: "Category ID and Module ID are required" });
    }

    try {
        const { data: category, error } = await supabase
            .from('learning_categories')
            .select('*')
            .eq('id', categoryId)
            .single();

        if (error) throw error;

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const modules = category.modules_json || [];
        const module = modules.find(m => m.id === moduleId);

        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }

        return res.status(200).json({
            success: true,
            module
        });
    } catch (error) {
        console.error('Get module by ID error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to fetch module" });
    }
};

// @desc Create feedback
const createFeedback = async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: "Please provide name, email, and message" });
    }

    try {
        const { data: feedback, error } = await supabase
            .from('feedbacks')
            .insert([{
                name,
                email,
                message
            }])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            feedback: {
                id: feedback.id,
                name: feedback.name,
                email: feedback.email,
                message: feedback.message,
                createdAt: feedback.created_at
            }
        });
    } catch (error) {
        console.error('Create feedback error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to submit feedback" });
    }
};

module.exports = {
    getDiseases,
    getDiseaseById,
    getLearningCategories,
    getLearningCategoryById,
    getModuleById,
    createFeedback
};
