const joi = require('@hapi/joi');

class taxonomiesValidator {
    constructor() {

    }
}
taxonomiesValidator.getTaxonomiesSchema = joi.object({
    page : joi.number().optional(),
    limit : joi.number().optional(),
    order : joi.string().optional().allow('').valid('ASC','DESC','asc','desc'),
    sort : joi.string().optional().allow(''),
    requestId : joi.string().optional(), // Use for detail api
    searchString : joi.string().optional().allow('',null),
    is_eguide : joi.number().optional().valid(0,1),
    timeZone : joi.string().optional(),
    isDownload : joi.number().optional().valid(0,1),
    type : joi.string().optional().valid('csv'),
    taxonId: joi.string().optional(), // Use for detail api
});
taxonomiesValidator.createTaxonomiesSchema = joi.object({
    kingdom: joi.string().allow('',null),
    phylum: joi.string().allow('',null),
    class: joi.string().required(),
    subclass: joi.string().allow('',null),
    order: joi.string().allow('',null),
    family: joi.string().required(),
    genus: joi.string().allow('',null),
    species: joi.string().allow('',null),
    scientific_name: joi.string().required(),
    taxon_level: joi.string().allow('',null),
    authority: joi.string().allow('',null),
    common_name_english: joi.string().required(),
    other_common_names_english: joi.string().allow('',null),
    taxonomic_notes: joi.string().allow('',null),
    spanish_names: joi.string().allow('',null),
    french_names: joi.string().allow('',null),
    iucn_id: joi.string().allow('',null),
    iucn_assessment: joi.string().allow('',null),
    cites_id: joi.string().allow('',null),
    cites_status: joi.string().required(),
    geographical_distribution: joi.string().allow('',null),
    geographical_distribution_iso: joi.string().allow('',null),
    iucn_reference_url: joi.string().allow('',null),
    gbif_reference_url: joi.string().allow('',null),
    cites_reference_url: joi.string().allow('',null),
});
taxonomiesValidator.updateTaxonomiesSchema = taxonomiesValidator.createTaxonomiesSchema.append({
    taxon_id:joi.string().required(),
});
taxonomiesValidator.deleteTaxonomiesSchema = joi.object({
    taxonId: joi.string().required()
});
module.exports = taxonomiesValidator;