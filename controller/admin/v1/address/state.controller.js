import { AppError } from "../../../../class/AppError.js";
import StateModel from "../../../../model/address/state.model.js";


export const createState = async (req, res, next) => {
  try {
    const { name, code, countryId, status = true } = req.body;

    const exists = await StateModel.findOne({ code, countryId });
    if (exists) {
      return next(new AppError("State code already exists for this country", 409));
    }

    const state = await StateModel.create({ name, code, countryId, status });

    res.status(201).json({
      response: true,
      message: "State created successfully",
      data: { state },
    });
  } catch (error) {
    next(error);
  }
};

export const getStates = async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    paginate = true,
    filters = {},
    sortField = "createdAt",
    sortOrder = "desc",
  } = req.body;

  try {
    const query = { ...filters };
    const sortOptions = {
      [sortField]: sortOrder === "asc" ? 1 : -1,
    };

    if (paginate) {
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
      const totalRecord = await StateModel.countDocuments(query);
      const totalPages = Math.ceil(totalRecord / limitNumber);

      const states = await StateModel.find(query)
        .populate("countryId", "name code") 
        .sort(sortOptions)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean();

      res.status(200).json({
        response: true,
        data: {
          states,
          pagination: {
            filterCriteria: query,
            page: pageNumber,
            skipping: (pageNumber - 1) * limitNumber,
            currentPage: pageNumber,
            totalPages,
            totalItems: totalRecord,
            perPage: limitNumber,
          },
        },
      });
    } else {
      const states = await StateModel.find(query)
        .populate("countryId", "name code")
        .sort(sortOptions)
        .lean();

      res.status(200).json({
        response: true,
        message: "States fetched successfully",
        data: { states },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateState = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await StateModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return next(new AppError("State not found", 404));
    }

    res.status(200).json({
      response: true,
      message: "State updated successfully",
      data: { state: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteState = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await StateModel.findByIdAndDelete(id);
    if (!deleted) {
      return next(new AppError("State not found", 404));
    }

    res.status(200).json({
      response: true,
      message: "State deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};



export const getStatesByCountry = async (req, res, next) => {
  const  countryId  = req.body?.filters?.countryId;
  

  try {
    const states = await StateModel.find({ countryId })
      .populate("countryId", "name code") 
      .sort({ name: 1 }) 
      .lean();

    res.status(200).json({
      response: true,
      message: "States fetched successfully",
      data: {
        states,
      },
    });
  } catch (error) {
    next(error);
  }
};