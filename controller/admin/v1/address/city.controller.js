import { AppError } from "../../../../class/AppError.js";
import CityModel from "../../../../model/address/city.model.js";


export const createCity = async (req, res, next) => {
  try {
    const { name, stateId, countryId, status = true } = req.body;

    const exists = await CityModel.findOne({ name, stateId });
    if (exists) {
      return next(new AppError("City already exists in this state", 409));
    }

    const city = await CityModel.create({ name, stateId, countryId, status });

    res.status(201).json({
      response: true,
      message: "City created successfully",
      data: { city },
    });
  } catch (error) {
    next(error);
  }
};

export const getCities = async (req, res, next) => {
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
      const totalRecord = await CityModel.countDocuments(query);
      const totalPages = Math.ceil(totalRecord / limitNumber);

      const cities = await CityModel.find(query)
        .populate("countryId", "name code")
        .populate("stateId", "name code")
        .sort(sortOptions)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean();

      res.status(200).json({
        response: true,
        data: {
          cities,
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
      const cities = await CityModel.find(query)
        .populate("countryId", "name code")
        .populate("stateId", "name code")
        .sort(sortOptions)
        .lean();

      res.status(200).json({
        response: true,
        message: "Cities fetched successfully",
        data: { cities },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateCity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await CityModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return next(new AppError("City not found", 404));
    }

    res.status(200).json({
      response: true,
      message: "City updated successfully",
      data: { city: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await CityModel.findByIdAndDelete(id);
    if (!deleted) {
      return next(new AppError("City not found", 404));
    }

    res.status(200).json({
      response: true,
      message: "City deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


export const getCityByState = async (req, res, next) => {
  const  stateId  = req.body?.filters?.stateId;
  try {
    const cities = await CityModel.find({ stateId })
      .populate("stateId", "name") 
      .sort({ name: 1 }) 
      .lean();

    res.status(200).json({
      response: true,
      message: "City fetched successfully",
      data: {
        cities,
      },
    });
  } catch (error) {
    next(error);
  }
};