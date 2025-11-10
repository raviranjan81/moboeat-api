import { AppError } from "../../../../class/AppError.js";
import CountryModel from "../../../../model/address/country.model.js";

export const createCountry = async (req, res, next) => {
  try {
    const { name, code, status = true } = req.body;

    const exists = await CountryModel.findOne({ code });
    if (exists) {
      return next(new AppError("Country code already exists", 409));
    }

    const country = await CountryModel.create({ name, code, status });

    res.status(201).json({
      response: true,
      message: "Country created successfully",
      data: { country },
    });
  } catch (error) {
    next(error);
  }
};

export const getCountries = async (req, res, next) => {
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
      const totalRecord = await CountryModel.countDocuments(query);
      const totalPages = Math.ceil(totalRecord / limitNumber);

      const countries = await CountryModel.find(query)
        .sort(sortOptions)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean();

      res.status(200).json({
        response: true,
        data: {
          countries,
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
      const countries = await CountryModel.find(query).sort(sortOptions).lean();
      res.status(200).json({
        response: true,
        message: "Countries fetched successfully",
        data: { countries },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateCountry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await CountryModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return next(new AppError("Country not found", 404));
    }

    res.status(200).json({
      response: true,
      message: "Country updated successfully",
      data: { country: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCountry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await CountryModel.findByIdAndDelete(id);
    if (!deleted) {
      return next(new AppError("Country not found", 404));
    }

    res.status(200).json({
      response: true,
      message: "Country deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};