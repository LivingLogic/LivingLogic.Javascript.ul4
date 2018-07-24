import sys, datetime, json, locale, builtins

def format(obj, fmt, lang=None):
	if isinstance(obj, (datetime.date, datetime.time, datetime.timedelta)):
		if lang is None:
			lang = "en"
		oldlocale = locale.getlocale()
		try:
			locale.setlocale(locale.LC_ALL, locale.normalize(lang))
			result = builtins.format(obj, fmt)
		finally:
			locale.setlocale(locale.LC_ALL, oldlocale)
		return result
	else:
		return builtins.format(obj, fmt)

def unformat(f, l):
	t = datetime.datetime(2002, 10, 19, 13, 34, 56)
	x = format(t, "%" + f, l).strip()
	for c in "%AaBbYymdIHMSp":
		formatted = format(t, "%" + c, l)
		if formatted:
			x = x.replace(formatted, "%" + c)
	return x

langs = "de de_AT en fr es it da sv nl pt cs sk pl hr ro hu tr ru zh.UTF-8 ko ja".split()

print("var translations = {")
for (i, l) in enumerate(langs):
	print("\t{}: {{".format(l.split(".")[0].lower()))
	print("\t\tms: {},".format(json.dumps([format(datetime.date(2012, m, 1), '%b', l) for m in range(1, 13)])))
	print("\t\tml: {},".format(json.dumps([format(datetime.date(2012, m, 1), '%B', l) for m in range(1, 13)])))
	print("\t\tws: {},".format(json.dumps([format(datetime.date(2012, 10, w), '%a', l) for w in range(14, 21)])))
	print("\t\twl: {},".format(json.dumps([format(datetime.date(2012, 10, w), '%A', l) for w in range(14, 21)])))
	print("\t\txf: {},".format(json.dumps(unformat("x", l))))
	print("\t\tXf: {},".format(json.dumps(unformat("X", l))))
	print("\t\tcf: {},".format(json.dumps(unformat("c", l))))
	print("\t}}{}".format("," if i<len(langs)-1 else ""))
print("}")
