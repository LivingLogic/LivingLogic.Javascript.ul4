lastback = False
startback = 0

unprintable = []

for i in range(0x7f, 0x10001):
	c = chr(i)
	thisback = repr(c)[1] == "\\"
	if thisback != lastback:
		# print("{:08x}|{!r}: {}".format(i, c, thisback))
		if thisback:
			startback = i
		else:
			end = i-1
			if startback == end:
				unprintable.append("\\u{:04x}".format(startback))
			else:
				unprintable.append("\\u{:04x}-\\u{:04x}".format(startback, i-1))
		lastback = thisback
print('/[{}]/'.format("".join(unprintable)))
