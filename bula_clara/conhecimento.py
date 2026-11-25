"""Dicionários de apoio: nomes comerciais/populares e classes terapêuticas.

As classes servem para o Agente de Interações: as bulas costumam citar a CLASSE
("anti-inflamatórios", "anticoagulantes") e não o nome de cada remédio.
Os termos de CLASSES foram conferidos nas seções 4 ("O que devo saber antes de usar")
e 3 ("Quando não devo usar") das bulas reais da base. A busca é por PREFIXO de palavra
(normalizado, sem acento), então "tiazid" pega "tiazidas", "tiazídico", "tiazídicos".
⚠️ Revisar/expandir com a equipe conforme novos medicamentos entrarem na base.
"""

# nome comercial / popular / grafia alternativa  ->  nome na base (= nome do arquivo da bula)
# Só remédios de UM princípio ativo: combinações (ex.: Dorflex) ficam de fora de propósito.
APELIDOS = {
    # dipirona
    "novalgina": "dipirona", "dipirona sodica": "dipirona", "dipirona monoidratada": "dipirona",
    "metamizol": "dipirona", "anador": "dipirona", "magnopyrol": "dipirona",
    # paracetamol
    "tylenol": "paracetamol", "acetaminofeno": "paracetamol", "acetaminofen": "paracetamol",
    "dorico": "paracetamol",
    # ibuprofeno
    "advil": "ibuprofeno", "alivium": "ibuprofeno", "buscofem": "ibuprofeno", "motrin": "ibuprofeno",
    # ácido acetilsalicílico
    "aas": "acido acetilsalicilico", "aspirina": "acido acetilsalicilico",
    "acido acetil salicilico": "acido acetilsalicilico", "ecasil": "acido acetilsalicilico",
    "somalgin": "acido acetilsalicilico",
    # losartana
    "cozaar": "losartana", "losartana potassica": "losartana", "losartan": "losartana",
    "aradois": "losartana", "corus": "losartana",
    # enalapril
    "renitec": "enalapril", "maleato de enalapril": "enalapril", "eupressin": "enalapril",
    # captopril
    "capoten": "captopril", "captosen": "captopril", "lopril": "captopril",
    # metformina
    "glifage": "metformina", "cloridrato de metformina": "metformina", "glucoformin": "metformina",
    # sinvastatina
    "zocor": "sinvastatina", "simvastatina": "sinvastatina", "sinvascor": "sinvastatina",
    "vaslip": "sinvastatina",
    # omeprazol
    "losec": "omeprazol", "peprazol": "omeprazol", "gastrium": "omeprazol",
    # amoxicilina
    "amoxil": "amoxicilina", "novocilin": "amoxicilina", "amoxicilina tri-hidratada": "amoxicilina",
    # varfarina
    "marevan": "varfarina", "coumadin": "varfarina", "varfarina sodica": "varfarina",
    "warfarina": "varfarina", "warfarin": "varfarina",
    # clopidogrel
    "plavix": "clopidogrel", "iscover": "clopidogrel", "bissulfato de clopidogrel": "clopidogrel",
    # levotiroxina
    "puran t4": "levotiroxina", "euthyrox": "levotiroxina", "synthroid": "levotiroxina",
    "levoid": "levotiroxina", "levotiroxina sodica": "levotiroxina",
    # hidroclorotiazida
    "clorana": "hidroclorotiazida", "drenol": "hidroclorotiazida", "hctz": "hidroclorotiazida",
}

# medicamento -> termos que uma OUTRA bula pode usar para se referir a ele
CLASSES = {
    "dipirona": ["dipirona", "metamizol", "analgésico", "antitérmic",
                 "pirazolon", "pirazolid"],
    "paracetamol": ["paracetamol", "acetaminofeno", "acetaminofen"],
    "ibuprofeno": ["ibuprofeno", "anti-inflamató", "antiinflamató", "anti -inflamató", "aine"],
    "acido acetilsalicilico": ["ácido acetilsalicílico", "acido acetilsalicilico", "aas", "salicilato",
                               "anti-inflamató", "antiagregante", "antiplaquetá",
                               "inibidores da agregação plaquetária"],
    "losartana": ["losartana", "anti-hipertensiv", "antagonista",
                  "bloqueador do receptor da angiotensina", "bloqueadores dos receptores de angiotensina",
                  "antagonistas do receptor da angiotensina", "antagonistas dos receptores de angiotensina"],
    "enalapril": ["enalapril", "anti-hipertensiv", "inibidores da eca", "inibidor da eca",
                  "inibidores da enzima conversora", "ieca"],
    "captopril": ["captopril", "anti-hipertensiv", "inibidores da eca", "inibidor da eca",
                  "inibidores da enzima conversora", "ieca"],
    "hidroclorotiazida": ["hidroclorotiazida", "diurético", "tiazid", "anti-hipertensiv"],
    "metformina": ["metformina", "antidiabétic", "hipoglicemiante", "biguanida"],
    "sinvastatina": ["sinvastatina", "estatina", "inibidores da hmg-coa", "hipolipemiante"],
    "omeprazol": ["omeprazol", "inibidores da bomba de prótons", "inibidor da bomba de prótons",
                  "inibidor de bomba de prótons", "inibidores de bomba de prótons"],
    "amoxicilina": ["amoxicilina", "antibiótico", "penicilin", "aminopenicilina", "betalactâmic"],
    "varfarina": ["varfarina", "anticoagulante", "cumarínic", "antagonistas da vitamina k"],
    "clopidogrel": ["clopidogrel", "antiagregante", "antiplaquetá", "tienopiridin",
                    "inibidores da agregação plaquetária"],
    "levotiroxina": ["levotiroxina", "hormônio tireoidiano", "hormônios tireoidianos",
                     "hormônio da tireoide", "hormônios da tireoide", "tiroxina"],
}

# termos de classe genéricos demais: só contam como interação se aparecerem perto de palavras de risco
TERMOS_FRACOS = {"analgésico", "antitérmic", "antagonista", "anti-hipertensiv", "antibiótico", "aine", "aas"}
